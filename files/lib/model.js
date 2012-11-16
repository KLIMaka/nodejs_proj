
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

	isConnected : function(other) {
		var head = this.adjSegments;
		while (head != null) {
			var seg = head.obj;
			if (seg.start.equals(other) || seg.end.equals(other)) {
				return seg;
			}
			head = head.next;
		}
		return false;
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
				order = (node.next.obj.start.equals(seg.end) || node.next.obj.start.equals(seg.start));
			node = node.next
		}
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

		var segs = [];
		for (var i = 0; i < pts.length; i++) {
			var a = pts[i];
			var b = pts[i+1 == pts.length ? 0 : i+1];
			seg = Model.Segment.create(a, b, null, null);
			this.segments.add(seg);
			segs.push(seg);
		}

		return this.sectors.add(Model.Sector.create(segs, true));
	},

	inVertices : function(vertex) {
		
		var list = this.vertices.list;
		for (var i in list) {
			if (vertex.equals(list[i]))
				return list[i];
		}
		return null;
	},

	segmentIntersection : function(vertex) {
		
		var list = this.segments.list;
		for (var i in list) {
			if (list[i].contain(vertex))
				return i;
		}
		return null;
	},

	addVertex : function(x, y) {

		var vertex = Model.Vertex.create(x,y);
		var v = this.inVertices(vertex);
		if (v != null)
			return v;

		this.vertices.add(vertex);

		var seg_idx = this.segmentIntersection(vertex);
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

}));