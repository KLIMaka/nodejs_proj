
Namespace.include('lib.math2d');
Namespace.include('lib.utils.list');

Namespace('Model.Vertex', Math2D.Vertex.extend({

	construct : function(x, y) {
		Math2D.Vertex.construct.call(this, x, y);
		this.adjSegments = Utils.List.create();
	},

	connectToSegment : function(segment) {
		this.adjSegments.insert(segment);
	},

	disconnectFromSegment : function(segment) {
		this.adjSegments.remove(segment);
	},

	adj : function(other) {
		var head = this.adjSegments;
		while (head != null) {
			var seg = head.obj;
			if (seg !== null && (seg.start === other || seg.end === other)) {
				return seg;
			}
			head = head.next;
		}
		return null;
	},

	replace : function(other) {

		var head = this.adjSegments;
		while (head != null) {
			if (head.obj.start === this) {
				head.obj.setStart(other);
			} else {
				head.obj.setEnd(other);
			}
			head = head.next;
		}
	},

}));

Namespace('Model.Segment', Math2D.Segment.extend({

	construct : function(start, end, front, back) {
		Math2D.Segment.construct.call(this, start, end);
		this.front = front;
		this.back = back;

		this.start.connectToSegment(this);
		this.end.connectToSegment(this);
	},

	remove : function() {
		this.start.disconnectFromSegment(this);
		this.end.disconnectFromSegment(this);
	},

	setStart : function(start) {
		this.start = start;
	},

	setEnd : function(end) {
		this.end = end;
	},

	hasVertex : function(vtx) {
		return this.start === vtx || this.end === vtx;
	},

}));

Namespace('Model.Sector', Class.extend({

	construct : function(segments, order) {
		this.segments = Utils.List.fromArray(segments);
		this.order = order;

		var node = this.segments;
		var last = null;
		while (node != null) {
			var seg = node.obj;
			if (order) seg.front  = this;
			else seg.back = this;
			if (node.next != null)
				order = (node.next.obj.start === seg.end) || (node.next.obj.start === seg.start);
			node = node.next
		}
	},

	containVertex : function(vtx) {

		var list = this.segments;
		while (list != null) {
			var seg = list.obj;
			if (seg.start === vtx || seg.end === vtx)
				return list;
			list = list.next;
		}
		return null;
	},

	getEdge : function(vtx) {

		var seg = this.containVertex(vtx);
		if (seg == null) return null;

		var next = seg.next == null ? this.segments.obj : seg.next.obj;
		seg = seg.obj;
		if (seg === this.segments.obj) {
			if (!(next.start === vtx || next.end === vtx)) {
				var last = next.last().obj;
				return [(last.start === vtx ? last.end : last.start), vtx, (seg.start == vtx ? seg.end : seg.start)];
			}
		}

		return [(seg.start == vtx ? seg.end : seg.start), vtx, (next.start == vtx ? next.end : next.start)];
	},

	split : function(vtx1, vtx2, sec) {

		var start = this.segments;
		var order = this.order;
		while ((order && (start.obj.start !== vtx1 && start.obj.start !== vtx2)) ||
			   (!order && (start.obj.end !== vtx1 && start.obj.end !== vtx2))) {
			order = (start.next.obj.start === start.obj.end) || (start.next.obj.start === start.obj.start);
			start = start.next;
		}

		var start_vtx = start.obj.hasVertex(vtx1) ? vtx1 : vtx2;
		var end_vtx = start_vtx === vtx1 ? vtx2 : vtx1;
		var new_sector = [];
		var end = start;
		var order = start_vtx === start.obj.start;

		do {
			new_sector.push(end.obj);
			end.removeThis();
		} while (!end.obj.hasVertex(end_vtx))
		new_sector.push(end.obj);
		end.removeThis();
		new_sector.push(sec);
		end.insertBefore(Utils.List.create(sec));

		if (start_vtx === vtx1) sec.front = this;
		else                    sec.back  = this;

		return Model.Sector.create(new_sector, order);
	},

}));

Namespace('Model.Level', Class.extend({

	construct : function(controller) {

		this.vertices = Utils.Holder.create();
		this.segments = Utils.Holder.create();
		this.sectors  = Utils.Holder.create();
		this.controller = controller;
	},

	addSector : function(vtxs) {

		var pts = [];
		for (var i = 0; i < vtxs.length; i++) {
			pts.push(this.addVertex(vtxs[i][0], vtxs[i][1]));
		}

		if (!Math2D.isCW(pts)) {
			pts.reverse();
			if (!Math2D.isCW(pts))
				return null;
		}

		var order = true;
		var segs = [];
		for (var i = 0; i < pts.length; i++) {
			var a = pts[i];
			var b = pts[i+1 == pts.length ? 0 : i+1];
			var seg = a.adj(b);
			if (seg == null) {
				seg = Model.Segment.create(a, b, null, null);
				this.segments.add(seg);
			} else if (i == 0 && seg.start !== a) {
				order = false;
			}
			segs.push(seg);
		}

		return this.sectors.add(Model.Sector.create(segs, order));
	},

	inVertices : function(vertex) {
		
		var list = this.vertices.list;
		for (var i in list) {
			if (vertex.equals(list[i]))
				return list[i];
		}
		return null;
	},

	onSegment : function(vertex) {
		
		var list = this.segments.list;
		for (var i in list) {
			if (list[i].contain(vertex))
				return i;
		}
		return null;
	},

	intersectSegment : function(seg) {

		var list = this.segments.list;
		for (var i in list) {
			if (list[i].isIntersects(seg))
				return true;
		}
		return false;
	},

	getContainigSector : function(seg) {

		var list = this.sectors.list;
		for (var i in list) {
			var sec = list[i];
			var e1 = sec.getEdge(seg.start);
			var e2 = sec.getEdge(seg.end);
			if (e1 == null || e2 == null) continue;

			if (e1[1].angle(e1[0], e1[2]) > e1[1].angle(e1[0], seg.end) && e2[1].angle(e2[0], e2[2]) > e2[1].angle(e2[0], seg.start)) {
				return sec;
			}
		}
		return null;
	},

	addVertex : function(x, y) {

		var vertex = Model.Vertex.create(x,y);
		var v = this.inVertices(vertex);
		if (v != null)
			return v;

		this.vertices.add(vertex);

		var seg_idx = this.onSegment(vertex);
		if (seg_idx != null) {
			var seg = this.segments.get(seg_idx);
			var a = Model.Segment.create(seg.start, vertex, seg.front, seg.back);
			var b = Model.Segment.create(vertex, seg.end, seg.front, seg.back);

			if (seg.front != null) {
				seg.front.segments.replace(seg, Utils.List.fromArray([a,b]));
			}
			if (seg.back != null) {
				seg.back.segments.replace(seg, Utils.List.fromArray([b,a]));
			}

			seg.remove();
			this.segments.remove(seg_idx);

			this.segments.add(a);
			this.segments.add(b);
		}

		return vertex;
	},

	weld : function(p1 ,p2) {

		var p1_idx = this.vertices.getId(p1);
		var p2_idx = this.vertices.getId(p2);

		if (p1_idx == null || p2_idx == null)	return null;

		var conseg = p1.adj(p2);
		if (conseg == null) return null;
		var conseg_idx = this.segments.getId(conseg);

		if (conseg.front != null) conseg.front.segments.remove(conseg);
		if (conseg.back != null) conseg.back.segments.remove(conseg);

		conseg.remove();
		this.segments.remove(conseg_idx);
		p2.replace(p1);
		this.vertices.remove(p2_idx);

		return p1;
	},

	splitSector : function(p1, p2) {

		var p1_idx = this.vertices.getId(p1);
		var p2_idx = this.vertices.getId(p2);

		if (p1_idx == null || p2_idx == null)	return false;

		var conseg = p1.adj(p2);
		if (conseg != null) return false;

		var seg = Model.Segment.create(p1, p2);
		if (this.intersectSegment(seg)) {
			seg.remove();
			return false;
		}

		var consec = this.getContainigSector(seg);
		if (consec == null) return false;

		var new_sector = consec.split(seg.start, seg.end, seg);
		this.sectors.add(new_sector);
		this.segments.add(seg);

		return new_sector;
	},

}));