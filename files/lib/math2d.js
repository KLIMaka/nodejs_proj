
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

	 : function() {
		return Math.abs(this.x*this.x + this.y*this.y);
	}

	unit : function() {
		return this.scale(1.0/this.lenght());
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
			var start = segment.start.pos;
			var end = segment.end.pos;
			var sqlen = end.subtract(start).sqlength();
			var t = intersect.subtract(start).dot(end.subtract(start)) / sqlen;
			if (t <= BSP.Line.EPSILON || t >= (1.0-BSP.Line.EPSILON)) {
				(this.side(Math.abs(t) <= BSP.Line.EPSILON ? end : start) >= 0.0 ? front : back).push(segment);
			} else {
				var a = new BSP.Segment(start, intersect);
				var b = new BSP.Segment(intersect, end);
				(this.side(start) >= 0.0 ? front : back).push(a);
				(this.side(end) >= 0.0 ? front : back).push(b);
			}
		} else if (this.side(segment.start.pos) == 0.0) {
			(this.normal.dot(segment.line.normal) >= 0.0 ? colinearFront : colinearBack).push(segment);
		} else {
			(this.side(segment.start.pos) ? front : back).push(segment);
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

		function sign(x) { return x > 0.0 ? 1.0 : (x < 0.0 ? -1.0 : 0.0);}
		var s1 = sign(this.line.side(segment.start));
		var s2 = sign(this.line.side(segment.end));
		var s3 = sign(segment.line.side(this.start));
		var s4 = sign(segment.line.side(this.end));

		var s12 = s1 + s2;
		var s34 = s3 + s4;

		if (s1 == 0 && s2 == 0 && s3 == 0 && s4 == 0)
			return false;

		return (s12 == 0 && s34 == 0) || 
		      !(s12 != 0 || s34 != 0);
	},

	contain : function(vertex) {

		if (this.line.side(vertex) != 0.0)
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