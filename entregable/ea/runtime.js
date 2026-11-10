// =============================================================================
// Bandada U - Importador de diagramas para Enterprise Architect (JScript)
// Generado por entregable/ea/generar-scripts-ea.mjs. NO editar a mano:
// edita la documentacion Mermaid y vuelve a generar.
//
// Requisitos: EA con un proyecto abierto. Se ejecuta desde
//   View > Scripting > (clic derecho en "Normal Scripts") New Script > JScript
// Pega todo este archivo y pulsa "Run". El resultado aparece en la pestana
// "Script" de la ventana System Output.
// Escrito en JScript clasico (ES3): sin let/const/flechas/forEach/indexOf.
// =============================================================================

var EA_TYPE_BY_KIND = {
  actor: "Actor",
  usecase: "UseCase",
  boundary: "Boundary",
  control: "Control",
  entity: "Entity",
  "class": "Class",
  object: "Object",
  component: "Component",
  node: "Node",
  state: "State",
  initial: "StateNode",
  final: "StateNode",
  note: "Note",
  "package": "Package"
};

var DIAGRAM_TYPE = {
  usecase: "Use Case",
  arch: "Component",
  state: "Statechart",
  "class": "Class",
  robust: "Analysis",
  seq: "Sequence",
  "package": "Package"
};

var stats = { packages: 0, elements: 0, connectors: 0, diagrams: 0, warnings: 0 };

function log(msg) {
  Session.Output(msg);
}

function warn(msg) {
  stats.warnings++;
  Session.Output("AVISO: " + msg);
}

function childPackage(parent, name) {
  var i, p;
  for (i = 0; i < parent.Packages.Count; i++) {
    p = parent.Packages.GetAt(i);
    if (p.Name == name) {
      return p;
    }
  }
  p = parent.Packages.AddNew(name, "");
  p.Update();
  parent.Packages.Refresh();
  stats.packages++;
  return p;
}

function packagePath(root, path) {
  var cur = root, i;
  for (i = 0; i < path.length; i++) {
    cur = childPackage(cur, path[i]);
  }
  return cur;
}

function addAttributes(el, attrs) {
  var i, a, parts, at;
  for (i = 0; i < attrs.length; i++) {
    a = attrs[i];
    at = el.Attributes.AddNew(a.name, a.type || "");
    if (a.vis) {
      at.Visibility = a.vis;
    }
    at.Update();
  }
  if (attrs.length > 0) {
    el.Attributes.Refresh();
  }
}

function addMethods(el, ops) {
  var i, o, m;
  for (i = 0; i < ops.length; i++) {
    o = ops[i];
    m = el.Methods.AddNew(o.name, o.ret || "");
    if (o.vis) {
      m.Visibility = o.vis;
    }
    if (o.isStatic) {
      m.IsStatic = true;
    }
    if (o.params) {
      m.Notes = "(" + o.params + ")";
    }
    m.Update();
  }
  if (ops.length > 0) {
    el.Methods.Refresh();
  }
}

// Clases: tamano segun el contenido y rejilla que respeta el alto de cada fila y el ancho de cada columna
// (una tabla con 17 atributos no se solapa con la de abajo aunque falle el autoacomodo de EA).
function layoutClasses(d) {
  var n = d.nodes.length, ncols, sizes = [], colW = [], rowH = [], i, j, k, m, len, maxLen, nodeW, nodeH, r, c, x, y, lines;
  ncols = n <= 4 ? n : Math.min(5, Math.ceil(Math.sqrt(n)));
  if (ncols < 1) {
    return;
  }
  for (i = 0; i < n; i++) {
    maxLen = (d.nodes[i].name || "").length + 4;
    lines = 0;
    if (d.nodes[i].attrs) {
      for (j = 0; j < d.nodes[i].attrs.length; j++) {
        m = d.nodes[i].attrs[j];
        len = (m.name || "").length + 3 + (m.type || "").length;
        maxLen = len > maxLen ? len : maxLen;
      }
      lines += d.nodes[i].attrs.length;
    }
    if (d.nodes[i].ops) {
      for (j = 0; j < d.nodes[i].ops.length; j++) {
        m = d.nodes[i].ops[j];
        len = (m.name || "").length + (m.params || "").length + (m.ret || "").length + 5;
        maxLen = len > maxLen ? len : maxLen;
      }
      lines += d.nodes[i].ops.length;
    }
    nodeW = Math.min(340, Math.max(190, Math.ceil(maxLen * 6.4) + 30));
    nodeH = 50 + 15 * lines + (d.nodes[i].attrs && d.nodes[i].ops ? 12 : 0);
    sizes.push({ w: nodeW, h: nodeH });
    c = i % ncols;
    r = Math.floor(i / ncols);
    colW[c] = Math.max(colW[c] || 0, nodeW);
    rowH[r] = Math.max(rowH[r] || 0, nodeH);
  }
  for (i = 0; i < n; i++) {
    c = i % ncols;
    r = Math.floor(i / ncols);
    x = 20;
    for (k = 0; k < c; k++) {
      x += colW[k] + 60;
    }
    y = 20;
    for (k = 0; k < r; k++) {
      y += rowH[k] + 50;
    }
    d.nodes[i].pos = "l=" + x + ";r=" + (x + sizes[i].w) + ";t=-" + y + ";b=-" + (y + sizes[i].h) + ";";
  }
}

// Posicion de cada nodo segun el tipo de diagrama.
function layoutNodes(d) {
  var i, n, col, row, cols = {}, counters = {}, x, y, w, h, k;
  if (d.type == "class") {
    layoutClasses(d);
  }
  var lifeIdx = 0, lifelines = 0;
  for (i = 0; i < d.nodes.length; i++) {
    if (d.nodes[i].kind != "note") {
      lifelines++;
    }
  }
  var colX = { actor: 20, boundary: 220, control: 460, entity: 700 };
  for (i = 0; i < d.nodes.length; i++) {
    n = d.nodes[i];
    w = 150;
    h = 60;
    if (d.type == "robust") {
      k = n.kind;
      counters[k] = (counters[k] || 0) + 1;
      x = colX[k] || 20;
      y = 20 + (counters[k] - 1) * 90;
    } else if (d.type == "usecase") {
      if (n.kind == "actor") {
        counters.actor = (counters.actor || 0) + 1;
        x = 20;
        y = 20 + (counters.actor - 1) * 110;
      } else {
        k = n.group || "";
        if (cols[k] === undefined) {
          cols.count = (cols.count || 0) + 1;
          cols[k] = cols.count;
        }
        counters[k] = (counters[k] || 0) + 1;
        x = 60 + cols[k] * 220;
        y = 20 + (counters[k] - 1) * 80;
        w = 190;
      }
    } else if (d.type == "seq") {
      if (n.kind == "note") {
        counters.note = (counters.note || 0) + 1;
        x = 20 + (d.nodes.length - counters.note) * 0;
        x = 20 + lifelines * 150 + 40;
        y = 20 + (counters.note - 1) * 90;
        w = 200;
        h = 70;
        n.pos = "l=" + x + ";r=" + (x + w) + ";t=-" + y + ";b=-" + (y + h) + ";";
        continue;
      }
      lifeIdx++;
      x = 20 + (lifeIdx - 1) * 150;
      y = 20;
      w = 130;
      h = 60 + 28 * (d.edges.length + 1);
    } else {
      // clase: rejilla de 4 columnas (luego se intenta autoacomodo)
      h = 50 + 15 * ((n.attrs ? n.attrs.length : 0) + (n.ops ? n.ops.length : 0));
      w = 190;
      x = 20 + (i % 4) * 240;
      y = 20 + Math.floor(i / 4) * 230;
    }
    if (n.pos) {
      continue;
    }
    n.pos = "l=" + x + ";r=" + (x + w) + ";t=-" + y + ";b=-" + (y + h) + ";";
  }
}

function buildDiagram(root, d) {
  var pkgRoot = packagePath(root, d.path);
  var diagram = pkgRoot.Diagrams.AddNew(d.title, DIAGRAM_TYPE[d.type]);
  diagram.Update();
  stats.diagrams++;

  var byId = {}, i, n, el, pk, dobj, e, src, dst, con, ctype, pos;

  layoutNodes(d);

  for (i = 0; i < d.nodes.length; i++) {
    n = d.nodes[i];
    pk = n.group && (d.type == "class" || d.type == "usecase") && n.kind != "actor"
      ? childPackage(pkgRoot, n.group) : pkgRoot;
    el = pk.Elements.AddNew(n.name, EA_TYPE_BY_KIND[n.kind] || "Class");
    if (n.kind == "initial") {
      el.Subtype = 100;
    }
    if (n.kind == "final") {
      el.Subtype = 101;
    }
    if (n.parent && byId[n.parent]) {
      el.ParentID = byId[n.parent].ElementID;
    }
    if (n.stereo) {
      el.Stereotype = n.stereo;
    }
    if (n.notes) {
      el.Notes = n.notes;
    }
    el.Update();
    stats.elements++;
    if (n.attrs) {
      addAttributes(el, n.attrs);
    }
    if (n.ops) {
      addMethods(el, n.ops);
    }
    byId[n.id] = el;
    dobj = diagram.DiagramObjects.AddNew(n.pos, "");
    dobj.ElementID = el.ElementID;
    dobj.Update();
  }

  for (i = 0; i < d.edges.length; i++) {
    e = d.edges[i];
    src = byId[e.from];
    dst = byId[e.to];
    if (!src || !dst) {
      warn(d.title + ": conector con extremo desconocido (" + e.from + " -> " + e.to + ")");
      continue;
    }
    ctype = e.type || "Association";
    con = src.Connectors.AddNew(e.label || "", ctype);
    con.SupplierID = dst.ElementID;
    if (e.stereo) {
      con.Stereotype = e.stereo;
    }
    if (e.dir) {
      con.Direction = e.dir;
    }
    if (e.seq) {
      con.SequenceNo = e.seq;
    }
    con.Update();
    if (e.srcCard || e.dstCard || e.srcAgg || e.dstAgg) {
      if (e.srcCard) { con.ClientEnd.Cardinality = e.srcCard; }
      if (e.dstCard) { con.SupplierEnd.Cardinality = e.dstCard; }
      if (e.srcAgg) { con.ClientEnd.Aggregation = e.srcAgg; }
      if (e.dstAgg) { con.SupplierEnd.Aggregation = e.dstAgg; }
      con.ClientEnd.Update();
      con.SupplierEnd.Update();
    }
    src.Connectors.Refresh();
    stats.connectors++;
  }

  diagram.DiagramObjects.Refresh();
  if (d.type == "class" || d.type == "usecase") {
    try {
      Repository.GetProjectInterface().LayoutDiagramEx(diagram.DiagramGUID, 0, 4, 20, 20, true);
    } catch (ex) {
      // Si falla el autoacomodo queda la rejilla inicial.
    }
  }
  Repository.ReloadDiagram(diagram.DiagramID);
}

function main() {
  var root, top, i, d, t0 = new Date();
  if (Repository.Models.Count == 0) {
    Session.Prompt("Abre un proyecto de EA con al menos un modelo raiz.", 0);
    return;
  }
  root = Repository.Models.GetAt(0);
  for (i = 0; i < root.Packages.Count; i++) {
    if (root.Packages.GetAt(i).Name == SCRIPT_TITLE) {
      Session.Prompt("Ya existe el paquete '" + SCRIPT_TITLE + "'. Borralo (o usa un proyecto vacio) y vuelve a ejecutar.", 0);
      return;
    }
  }
  log("== " + SCRIPT_TITLE + ": " + DIAGRAMS.length + " diagramas ==");
  Repository.EnableUIUpdates = false;
  try {
    for (i = 0; i < DIAGRAMS.length; i++) {
      d = DIAGRAMS[i];
      d.path = [SCRIPT_TITLE].concat(d.path);
      buildDiagram(root, d);
      log((i + 1) + "/" + DIAGRAMS.length + "  " + d.title);
    }
  } catch (err) {
    log("ERROR: " + (err.message || err));
  }
  Repository.EnableUIUpdates = true;
  Repository.RefreshModelView(root.PackageID);
  log("Listo en " + Math.round((new Date() - t0) / 1000) + " s: " + stats.diagrams + " diagramas, " +
      stats.elements + " elementos, " + stats.connectors + " conectores, " + stats.warnings + " avisos.");
}

main();
