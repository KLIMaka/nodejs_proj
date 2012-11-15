
Namespace('Math2D', {

	EPSILON : 1e-5,
	rad2deg : 180/Math.PI,
	deg2rad : Math.PI/180,

	isCW : function(polygon) {

		var angsum = 0;
		for (var i = 0; i < polygon.length; i++) {
			var a = polygon[i-1 < 0 ? polygon.length-1 : i-1];
			var b = polygon[i+1 >= polygon.length ? 0 : i+1];
			var c = polygon[i];
			angsum += c.angle(a,b);
		}

		return angsum == 180*(polygon.length-2);
	},

});

Namespace('Math2D.Vector', Class.extend({

	construct : function(x, y) {
		if (arguments.length == 2) {
			this.x = x;
			this.y = y;
		} else if ('x' in x) {
			this.x = x.x;
			this.y = x.y;
		} else {
			this.x = x[0];
			this.y = x[1];
		}
	},

	clone : function() {
		return Math2D.Vector.create(this.x, this.y);
	},

	negated : function() {
		return Math2D.Vector.create(-this.x, -this.y);
	},

	negate : function() {
		this.x = -this.x;
		this.y = -this.y;
		return this;
	},

	add : function(a) {
		return Math2D.Vector.create(this.x + a.x, this.y + a.y);
	},

	subtract : function(a) {
		return Math2D.Vector.create(this.x - a.x, this.y - a.y);
	},

	scaled : function(a) {
		return Math2D.Vector.create(this.x * a, this.y + a);
	},

	scale : function(a) {
		this.x *= a;
		this.y *= a;
		return this;
	},

	dot : function(a) {
		return this.x * a.x + this.y * a.y;
	},

	lerp : function(a, t) {
		return this.add(a.subtract(this).scale(t));
	},

	length : function() {
		return Math.sqrt(this.x*this.x + this.y*this.y);
	},

	sqlength : function() {
		return Math.abs(this.x*this.x + this.y*this.y);
	},

	unit : function() {
		return this.scale(1.0/this.length());
	},

	normalize : function() {
		var len = this.length();
		this.x /= len;
		this.y /= len;
		return this;
	},

	orthed : function() {
		return Math2D.Vector.create(-this.y, this.x);
	},

	ortho : function() {
		var tmp = this.x;
		this.x = -this.y;
		this.y = tmp;
		return this;
	},

	ang : function() {
		var unit = this.unit();
		var ang = Math2D.rad2deg*Math.acos(unit.x);
		ang = unit.y < 0 ? 360 - ang : ang;
		return -ang;
	},

	equals : function(a) {
		return a.x == this.x && a.y == this.y;
	},

	toString : function() {
		return '['+this.x+','+this.y+']';
	},
}));

Namespace('Math2D.Vertex', Math2D.Vector.extend({

	angle : function(a, b) {

		var toA = Math2D.Vector.create(a.x - this.x, a.y - this.y);
		var toB = Math2D.Vector.create(b.x - this.x, b.y - this.y);
		var ang = toB.ang() - toA.ang();
		return ang < 0 ? 360 + ang : ang;
	},

}));

Namespace('Math2D.Line', Class.extend({

	construct : function(normal, w) {
		this.normal = normal.clone();
		this.w = w;
	},

	clone : function() {
		return Math2D.Line.create(this.normal, this.w);
	},

	flip : function() {
		this.normal.negate();
		this.w = -this.w;
	},

	intersect : function(line) {
		
		var r = this.normal.x*line.normal.y - line.normal.x*this.normal.y;
		if (r == 0.0) return null;

		var x = (this.normal.y*line.w - line.normal.y*this.w) / r;
		var y = (this.w*line.normal.x - line.w*this.normal.x) / r;
		return Math2D.Vertex.create(x, y);
	},

	side : function(point) {
		return this.normal.dot(point) + this.w;
	},

	splitSegment : function(segment, colinearFront, colinearBack, front, back) {

		var intersect = this.intersect(segment.line);
		if (intersect != null) {
			var start = segment.start;
			var end = segment.end;
			var sqlen = end.subtract(start).sqlength();
			var t = intersect.subtract(start).dot(end.subtract(start)) / sqlen;
			if (t <= Math2D.EPSILON || t >= (1.0 - Math2D.EPSILON)) {
				(this.side(Math.abs(t) <= Math2D.EPSILON ? end : start) >= 0.0 ? front : back).push(segment);
			} else {
				var a = Math2D.Segment.create(start, intersect);
				var b = Math2D.Segment.create(intersect, end);
				(this.side(start) >= 0.0 ? front : back).push(a);
				(this.side(end) >= 0.0 ? front : back).push(b);
			}
		} else if (this.side(segment.start) == 0.0) {
			(this.normal.dot(segment.line.normal) >= 0.0 ? colinearFront : colinearBack).push(segment);
		} else {
			(this.side(segment.start) ? front : back).push(segment);
		}
	},

}));

Namespace('Math2D.Segment', Class.extend({

	construct : function(start, end) {

		this.start = start;
		this.end = end;

		var normal = this.end.subtract(this.start).normalize().ortho();
		var w = normal.dot(this.start);
		this.line = Math2D.Line.create(normal, -w);
	},

	clone : function() {
		return Math2D.Segment.create(this.start.clone(), this.end.clone());
	},

	flip : function() {
		var tmp = this.start;
		this.start = this.end;
		this.end = tmp;
		this.line.flip();
	},

	toString : function() {
		return "("+this.start.toString()+"-"+this.end.toString()+")";
	},

	isIntersects : function(segment) {

		if (this.start.equals(segment.start) || this.start.equals(segment.start) ||
			this.end.equals(segment.start) || this.end.equals(segment.end)) {
			return false;
		}

		if (this.contain(segment.start) || this.contain(segment.end) || 
			segment.contain(this.start) || segment.contain(this.end)) {
			return true;
		}

		var inter = this.line.intersect(segment.line);
		return inter != null && this.contain(inter) && segment.contain(inter);
	},

	contain : function(vertex) {

		if (Math.abs(this.line.side(vertex)) > Math2D.EPSILON)
			return false;

		var start = this.start;
		var end = this.end;
		var sqlen = end.subtract(start).sqlength();
		var t = vertex.subtract(start).dot(end.subtract(start)) / sqlen;

		return !(t <= Math2D.EPSILON || t >= (1.0 - Math2D.EPSILON));
	},

	length : function() {
		return this.end.subtract(this.start).length();
	},

}));