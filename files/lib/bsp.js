
Namespace('BSP', {

	intersect : function(a, b) {
		
		var a_ = a.clone();
		var b_ = b.clone();

		a_.invert();
		a_.clipTo(b_);
		a_.invert();
		b_.clipTo(a_);
		a_.build(b_.allSegments());
		return a_;
	},

	union : function(a, b) {

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
	},
});

Namespace('BSP.Node');
BSP.Node = function(){};
BSP.Node = Class.extend(BSP.Node, {

	construct :  function(segments) {

		this.line = null;
		this.front = null;
		this.back = null;
		this.segments = [];
		if (segments) this.build(segments);
	},

	clone : function() {
		
		var node = BSP.Node.create();
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

		segments = segments.filter(function(seg){ return !seg.start.equals(seg.end); });

		if (segments.length == 0) return;
		if (!this.line) this.line = segments[0].line.clone();
		
		var front = [], back = [];
		for (var i = 0; i < segments.length; i++) {
			this.line.splitSegment(segments[i], this.segments, this.segments, front, back);
		}

		if (front.length != 0) {
			if (this.front == null) this.front = BSP.Node.create();
			this.front.build(front);
		}

		if (back.length != 0) {
			if (this.back == null) this.back = BSP.Node.create();
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
	},

}));