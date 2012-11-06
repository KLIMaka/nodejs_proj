
Namespace('Model.Vertex' Class.extend({

	construct : function(x, y) {
		this.x = x;
		this.y = y;
	},

	equal : function(vtx) {
		return this.x == vtx.x && this.y == vtx.y;
	},
}));

Namespace('Model.Segment' Class.extend({

	construct : function(p1, p2, front, back) {
		this.p1 = p1;
		this.p2 = p2;
		this.front = front;
		this.back = back;
	},

	intersects : function(vertex) {
		
	},

}));

Namespace('Model.Sector', Class.extend({

	construct : function(segments) {
		this.segments = segments;
	},

}));

Namespace('Model.Utils', {

	samePoint : function(point) {
		return point.equals(this.point);
	},

	inersect : function(sesgment) {
		return sesgment.intersects(this.point)
	}
});

Namespace('Model.Level', Class.extend({

	construct : function(controller) {

		this.vertices = [];
		this.segments = [];
		this.sectors = [];
		this.controller = controller;
	},

	inVertices : function(vertex) {
		
		var vtxs = this.vertices;
		for (var i = 0; i < vtxs.length; i++) {
			if (vertex.equals(vtxs[i]))
				return true;
		}
		return false;
	},

	segmentIntersection : function(vertex) {
		
		var segs = this.segments;
		for (var i = 0; i <  segs.length; i++) {
			if (segs[i].intersects(vertsx))
				return segs[i];
		}
		return null;
	},

	addVertex : function(x, y) {

		var utils = Model.Utils;
		var point = Model.Vertex.create(x,y);
		utils.samePoint.point = point;
		if (this.vertices.some(utils.samePoint) {
			return false;
		}

		this.vertices.push(point);
		this.controller.addPoint(point);

		var seg = null;
		if (this.segments.some(intersects)) {
			segs = seg.split(point);
			seg.remove();
			
		}


	},

}));