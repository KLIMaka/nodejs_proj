
var BSP = function() {
};

BSP.intersect = function(a, b) {
	
	var a_ = a.clone();
	var b_ = b.clone();

	a_.invert();
	a_.clipTo(b_);
	a_.invert();
	b_.clipTo(a_);
	a_.build(b_.allSegments());
	return a_;
}

BSP.union = function(a, b) {

	var a_ = a.clone();
	var b_ = b.clone();

	a_.invert();
	b_.clipTo(a_);
	a_.invert();
	b_.invert()
	a_.clipTo(b_);
	b_.invert();
	a_.build(b_.allSegments());
	return a_;
}

BSP.Vector = function(x, y) {
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
}

BSP.Vector.prototype = {

	clone : function() {
		return new BSP.Vector(this.x, this.y);
	},

	negated : function() {
		return new BSP.Vector(-this.x, -this.y);
	},

	negate : function() {
		this.x = -this.x;
		this.y = -this.y;
		return this;
	},

	add : function(a) {
		return new BSP.Vector(this.x + a.x, this.y + a.y);
	},

	subtract : function(a) {
		return new BSP.Vector(this.x - a.x, this.y - a.y);
	},

	scaled : function(a) {
		return new BSP.Vector(this.x * a, this.y + a);
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
		return new BSP.Vector(-this.y, this.x);
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
}

BSP.Vertex = function(pos) {
	this.pos = new BSP.Vector(pos);
}

BSP.Vertex.prototype = {

	clone : function() {
		return new BSP.Vertex(this.pos.clone());
	},

	flip : function() {
	},

	interpolate : function(other, t) {
		return new BSP.Vertex(this.pos.lerp(other, t));
	},

	toString : function() {
		return this.pos.toString();
	}
}

BSP.Line = function(normal, w) {
	this.normal = normal.clone();
	this.w = w;
}

BSP.Line.EPSILON = 1e-5;

BSP.Line.prototype = {

	clone : function() {
		return new BSP.Line(this.normal.clone(), this.w);
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
		return new BSP.Vector(x, y);
	},

	side : function(point) {
		return this.normal.dot(point) + this.w >= 0.0;
	},

	splitSegment : function(segment, colinearFront, colinearBack, front, back) {

		var intersect = this.intersect(segment.line);
		if (intersect != null) {
			var start = segment.start.pos;
			var end = segment.end.pos;
			var len = end.subtract(start).length();
			var t = intersect.subtract(start).dot(end.subtract(start)) / (len*len);
			if (t <= BSP.Line.EPSILON || t >= (1.0-BSP.Line.EPSILON)) {
				(this.side(Math.abs(t) <= BSP.Line.EPSILON ? end : start) ? front : back).push(segment);
			} else {
				var a = new BSP.Segment(start, intersect);
				var b = new BSP.Segment(intersect, end);
				(this.side(start) ? front : back).push(a);
				(this.side(end) ? front : back).push(b);
			}
		} else if (this.normal.dot(segment.start.pos)+this.w == 0.0) {
			(this.normal.dot(segment.line.normal) >= 0.0 ? colinearFront : colinearBack).push(segment);
		} else {
			(this.side(segment.start.pos) ? front : back).push(segment);
		}
	},

}

BSP.Segment = function(start, end) {
	
	this.start = new BSP.Vertex(start);
	this.end = new BSP.Vertex(end);
	var normal = this.end.pos.subtract(this.start.pos).normalize().ortho();
	var w = normal.dot(this.start.pos);
	this.line = new BSP.Line(normal, -w);
}

BSP.Segment.prototype = {

	clone : function() {
		return new BSP.Segment(this.start.pos, this.end.pos);
	},

	flip : function() {
		var tmp = this.start;
		this.start = this.end;
		this.end = tmp;
	},

	toString : function() {
		return this.start.toString();
	},
}

BSP.Node = function(segments) {
	
	this.line = null;
	this.front = null;
	this.back = null;
	this.segments = [];
	if (segments) this.build(segments);
}

BSP.Node.prototype = {

	clone : function() {
		
		var node = new BSP.Node();
		node.line = this.line && this.line.clone();
		node.front = this.front && this.front.clone();
		node.back = this.back && this.back.clone();
		node.segments = this.segments.map(function(s){ return s.clone(); });
		return node;
	},

	invert : function() {

		for (var i = 0; i < this.segments.length; i++) {
			this.segments[i].flip();
		}
		this.line.flip();
		if (this.front) this.front.invert();
		if (this.back) this.back.invert();
		var tmp = this.front;
		this.front = this.back;
		this.back = tmp;
	},

	build : function(segments) {

		if (segments.length == 0) return;
		if (!this.line) this.line = segments[0].line.clone();
		
		var front = [], back = [];
		for (var i = 0; i < segments.length; i++) {
			this.line.splitSegment(segments[i], this.segments, this.segments, front, back);
		}

		if (front.length != 0) {
			if (this.front == null) this.front = new BSP.Node();
			this.front.build(front);
		}

		if (back.length != 0) {
			if (this.back == null) this.back = new BSP.Node();
			this.back.build(back);
		}
	},

	allSegments : function() {
		var segments = this.segments.slice();
		if (this.front) segments = segments.concat(this.front.allSegments());
		if (this.back) segments = segments.concat(this.back.allSegments());
		return segments;
	},

	clipSegments : function(segments) {

		if (this.line == null) return segments.slice();
		var front = [], back = [];
		for (var i = 0; i < segments.length; i++) {
			this.line.splitSegment(segments[i], front, back, front, back);
		}
		if (this.front) front = this.front.clipSegments(front);
		if (this.back) back = this.back.clipSegments(back);
		else back = [];
		return front.concat(back);
	},

	clipTo : function(bsp) {
		this.segments = bsp.clipSegments(this.segments);
		if (this.front) this.front.clipTo(bsp);
		if (this.back) this.back.clipTo(bsp);
	}
}