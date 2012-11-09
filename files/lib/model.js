
Namespace('Model.Vertex', Math2D.Vertex.extend({

	construct : function(x, y) {
		Math2D.Vertex.construct.call(this, x, y);
		this.adjSegments = Utils.list.create();
	},

	connectToSegment : function(segment) {
		this.adjSegments.insert(segment);
	},

	disconnectFromSegment : function(segment) {
		this.adjSegments.remove(segment);
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

	construct : function(segments) {
		this.segments = segments;
	},

}));

Namespace('Model.Level', Class.extend({

	construct : function(controller) {

		this.vertices = Utils.Holder.create();
		this.segments = Utils.Holder.create();
		this.sectors  = Utils.Holder.create();
		this.controller = controller;
	},

	inVertices : function(vertex) {
		
		var list = this.vertices.list;
		for (var in list) {
			if (vertex.equals(list[i]))
				return true;
		}
		return false;
	},

	segmentIntersection : function(vertex) {
		
		var list = this.vertices.list;
		for (var in list) {
			if (list[i].contain(vertsx))
				return i;
		}
		return null;
	},

	addVertex : function(x, y) {

		var vertex = Model.Vertex.create(x,y);
		if (this.inVertices(vertex))
			return false;

		this.vertices.add(vertex);
		this.controller.addPoint(vertex);

		var seg_idx = this.segmentIntersection(vertex);
		if (seg_idx != null) {
			var seg = this.segments.get(seg_idx);
			var a = Math2D.Segment.create(seg.start, vertex, seg.front, seg.back);
			var b = Math2D.Segment.create(vertex, seg.end, seg.front, seg.back);

			seg.remove();
			this.segments.remove(seg_idx);

			this.segments.add(a);
			this.segments.add(b);
		}

		return true;
	},

	weld : function(v1, v2) {

	},



}));