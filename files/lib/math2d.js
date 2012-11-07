
Namespace('Math2D', {

	EPSILON : 1e-5,

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

	equals : function(a) {
		return a.x == this.x && a.y == this.y;
	},

	toString : function() {
		return '['+this.x+','+this.y+']';
	},
}));

Namespace('Math2D.Vertex', Math2D.Vector.extend({

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

		this.start = Math2D.Vertex.create(start);
		this.end = Math2D.Vertex.create(end);

		var normal = this.end.subtract(this.start).normalize().ortho();
		var w = normal.dot(this.start);
		this.line = Math2D.Line.create(normal, -w);
	},

	clone : function() {
		return Math2D.Segment.create(this.start, this.end);
	},

	flip : function() {
		var tmp = this.start;
		this.start = this.end;
		this.end = tmp;
		this.line.flip();
	},

	toString : function() {
		return this.start.toString();
	},

	isIntersects : function(segment) {

		// function sign(x) { return x > 0.0 ? 1.0 : (x < 0.0 ? -1.0 : 0.0);}
		// var s1 = sign(this.line.side(segment.start));
		// var s2 = sign(this.line.side(segment.end));
		// var s3 = sign(segment.line.side(this.start));
		// var s4 = sign(segment.line.side(this.end));

		// var s12 = s1 + s2;
		// var s34 = s3 + s4;

		// if (s1 == 0 && s2 == 0 && s3 == 0 && s4 == 0)
		// 	return false;

		// return (s12 == 0 && s34 == 0) || 
		//       !(s12 != 0 || s34 != 0);
		var inter = this.line.intersect(segment.line);
		return inter != null && this.contain(inter) && segment.line.contain(inter);
	},

	contain : function(vertex) {

		if (Math.abs(this.line.side(vertex)) > Math2D.EPSILON)
			return false;

		var start = this.start;
		var end = this.end;
		var sqlen = end.subtract(start).sqlength();
		var t = vertex.subtract(start).dot(end.subtract(start)) / sqlen;

		return t >= 0.0 && t <= 1.0;
	},

	length : function() {
		return this.end.subtract(this.start).length();
	},

}));