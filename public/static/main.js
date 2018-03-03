(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

class Vector3{
	constructor(x,y,z){	this.x = x || 0.0;	this.y = y || 0.0;	this.z = z || 0.0; }

	magnitude(v){
		//Only get the magnitude of this vector
		if(v === undefined) return Math.sqrt( this.x*this.x + this.y*this.y + this.z*this.z );

		//Get magnitude based on another vector
		var x = v.x - this.x,
			y = v.y - this.y,
			z = v.y - this.z;

		return Math.sqrt( x*x + y*y + z*z );
	}

	normalize(){ var mag = this.magnitude(); this.x /= mag; this.y /= mag; this.z /= mag; return this;}

	set(x,y,z){ this.x = x; this.y = y; this.z = z;	return this; }

	multiScalar(v){ this.x *= v; this.y *= v; this.z *= v; return this; }

	getArray(){ return [this.x,this.y,this.z]; }
	getFloatArray(){ return new Float32Array([this.x,this.y,this.z]);}
	clone(){ return new Vector3(this.x,this.y,this.z); }

	static cross(out, a, b) {
	  let ax = a[0], ay = a[1], az = a[2];
	  let bx = b[0], by = b[1], bz = b[2];

	  out[0] = ay * bz - az * by;
	  out[1] = az * bx - ax * bz;
	  out[2] = ax * by - ay * bx;
	  return out;
	}
}


//###########################################################################################
class Matrix4{
	constructor(){ this.raw = Matrix4.identity(); }

	//....................................................................
	//Transformations Methods
	vtranslate(v){		Matrix4.translate(this.raw,v.x,v.y,v.z); return this; }
	translate(x,y,z){	Matrix4.translate(this.raw,x,y,z); return this;}

	rotateY(rad){		Matrix4.rotateY(this.raw,rad); return this; }
	rotateX(rad){		Matrix4.rotateX(this.raw,rad); return this; }
	rotateZ(rad){		Matrix4.rotateZ(this.raw,rad); return this; }

	vscale(vec3){		Matrix4.scale(this.raw,vec3.x,vec3.y,vec3.z); return this; }
	scale(x,y,z){		Matrix4.scale(this.raw,x,y,z); return this; }

	invert(){			Matrix4.invert(this.raw); return this; }

	//....................................................................
	//Methods
	//Bring is back to identity without changing the transform values.
	resetRotation(){
		for(var i=0; i < this.raw.length; i++){
			if(i >= 12 && i <= 14) continue;
			this.raw[i] = (i % 5 == 0)? 1 : 0;  //only positions 0,5,10,15 need to be 1 else 0.
		}

		return this;
	}

	//reset data back to identity.
	reset(){
		for(var i=0; i < this.raw.length; i++) this.raw[i] = (i % 5 == 0)? 1 : 0; //only positions 0,5,10,15 need to be 1 else 0.
		return this;
	}

	//....................................................................
	//Static Data Methods
	static identity(){
		var a = new Float32Array(16);
		a[0] = a[5] = a[10] = a[15] = 1;
		return a;
	}

	//from glMatrix
	static perspective(out, fovy, aspect, near, far){
		var f = 1.0 / Math.tan(fovy / 2),
			nf = 1 / (near - far);
	    out[0] = f / aspect;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 0;
	    out[4] = 0;
	    out[5] = f;
	    out[6] = 0;
	    out[7] = 0;
	    out[8] = 0;
	    out[9] = 0;
	    out[10] = (far + near) * nf;
	    out[11] = -1;
	    out[12] = 0;
	    out[13] = 0;
	    out[14] = (2 * far * near) * nf;
	    out[15] = 0;
	}


	static ortho(out, left, right, bottom, top, near, far) {
		var lr = 1 / (left - right),
			bt = 1 / (bottom - top),
			nf = 1 / (near - far);
		out[0] = -2 * lr;
		out[1] = 0;
		out[2] = 0;
		out[3] = 0;
		out[4] = 0;
		out[5] = -2 * bt;
		out[6] = 0;
		out[7] = 0;
		out[8] = 0;
		out[9] = 0;
		out[10] = 2 * nf;
		out[11] = 0;
		out[12] = (left + right) * lr;
		out[13] = (top + bottom) * bt;
		out[14] = (far + near) * nf;
		out[15] = 1;
	};


	//https://github.com/toji/gl-matrix/blob/master/src/gl-matrix/mat4.js
	//make the rows into the columns
	static transpose(out, a){
		//If we are transposing ourselves we can skip a few steps but have to cache some values
		if (out === a) {
			var a01 = a[1], a02 = a[2], a03 = a[3], a12 = a[6], a13 = a[7], a23 = a[11];
			out[1] = a[4];
			out[2] = a[8];
			out[3] = a[12];
			out[4] = a01;
			out[6] = a[9];
			out[7] = a[13];
			out[8] = a02;
			out[9] = a12;
			out[11] = a[14];
			out[12] = a03;
			out[13] = a13;
			out[14] = a23;
		}else{
			out[0] = a[0];
			out[1] = a[4];
			out[2] = a[8];
			out[3] = a[12];
			out[4] = a[1];
			out[5] = a[5];
			out[6] = a[9];
			out[7] = a[13];
			out[8] = a[2];
			out[9] = a[6];
			out[10] = a[10];
			out[11] = a[14];
			out[12] = a[3];
			out[13] = a[7];
			out[14] = a[11];
			out[15] = a[15];
		}

		return out;
	}

	//Calculates a 3x3 normal matrix (transpose inverse) from the 4x4 matrix
	static normalMat3(out,a){
		var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
			a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
			a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
			a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

			b00 = a00 * a11 - a01 * a10,
			b01 = a00 * a12 - a02 * a10,
			b02 = a00 * a13 - a03 * a10,
			b03 = a01 * a12 - a02 * a11,
			b04 = a01 * a13 - a03 * a11,
			b05 = a02 * a13 - a03 * a12,
			b06 = a20 * a31 - a21 * a30,
			b07 = a20 * a32 - a22 * a30,
			b08 = a20 * a33 - a23 * a30,
			b09 = a21 * a32 - a22 * a31,
			b10 = a21 * a33 - a23 * a31,
			b11 = a22 * a33 - a23 * a32,

		// Calculate the determinant
		det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

		if (!det) return null;

		det = 1.0 / det;

		out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
		out[1] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
		out[2] = (a10 * b10 - a11 * b08 + a13 * b06) * det;

		out[3] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
		out[4] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
		out[5] = (a01 * b08 - a00 * b10 - a03 * b06) * det;

		out[6] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
		out[7] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
		out[8] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
		return out;
	}

	//....................................................................
	//Static Operation

	//https://github.com/gregtatum/mdn-model-view-projection/blob/master/shared/matrices.js
	static multiplyVector(mat4, v) {
		var x = v[0], y = v[1], z = v[2], w = v[3];
		var c1r1 = mat4[ 0], c2r1 = mat4[ 1], c3r1 = mat4[ 2], c4r1 = mat4[ 3],
			c1r2 = mat4[ 4], c2r2 = mat4[ 5], c3r2 = mat4[ 6], c4r2 = mat4[ 7],
			c1r3 = mat4[ 8], c2r3 = mat4[ 9], c3r3 = mat4[10], c4r3 = mat4[11],
			c1r4 = mat4[12], c2r4 = mat4[13], c3r4 = mat4[14], c4r4 = mat4[15];

		return [
			x*c1r1 + y*c1r2 + z*c1r3 + w*c1r4,
			x*c2r1 + y*c2r2 + z*c2r3 + w*c2r4,
			x*c3r1 + y*c3r2 + z*c3r3 + w*c3r4,
			x*c4r1 + y*c4r2 + z*c4r3 + w*c4r4
		];
	}

	//https://github.com/toji/gl-matrix/blob/master/src/gl-matrix/vec4.js, vec4.transformMat4
	static transformVec4(out, v, m){
		out[0] = m[0] * v[0] + m[4] * v[1] + m[8]	* v[2] + m[12] * v[3];
		out[1] = m[1] * v[0] + m[5] * v[1] + m[9]	* v[2] + m[13] * v[3];
		out[2] = m[2] * v[0] + m[6] * v[1] + m[10]	* v[2] + m[14] * v[3];
		out[3] = m[3] * v[0] + m[7] * v[1] + m[11]	* v[2] + m[15] * v[3];
		return out;
	}

	//From glMatrix
	//Multiple two mat4 together
	static mult(out, a, b){
	    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
	        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
	        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
	        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

	    // Cache only the current line of the second matrix
	    var b0  = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
	    out[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
	    out[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
	    out[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
	    out[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

	    b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
	    out[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
	    out[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
	    out[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
	    out[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

	    b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
	    out[8] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
	    out[9] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
	    out[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
	    out[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

	    b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
	    out[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
	    out[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
	    out[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
	    out[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
	    return out;
	}


	//....................................................................
	//Static Transformation
	static scale(out,x,y,z){
	    out[0] *= x;
	    out[1] *= x;
	    out[2] *= x;
	    out[3] *= x;
	    out[4] *= y;
	    out[5] *= y;
	    out[6] *= y;
	    out[7] *= y;
	    out[8] *= z;
	    out[9] *= z;
	    out[10] *= z;
	    out[11] *= z;
	    return out;
	};

	static rotateY(out,rad) {
		var s = Math.sin(rad),
			c = Math.cos(rad),
			a00 = out[0],
			a01 = out[1],
			a02 = out[2],
			a03 = out[3],
			a20 = out[8],
			a21 = out[9],
			a22 = out[10],
			a23 = out[11];

		// Perform axis-specific matrix multiplication
		out[0] = a00 * c - a20 * s;
		out[1] = a01 * c - a21 * s;
		out[2] = a02 * c - a22 * s;
		out[3] = a03 * c - a23 * s;
		out[8] = a00 * s + a20 * c;
		out[9] = a01 * s + a21 * c;
		out[10] = a02 * s + a22 * c;
		out[11] = a03 * s + a23 * c;
		return out;
	}

	static rotateX(out,rad) {
	    var s = Math.sin(rad),
	        c = Math.cos(rad),
	        a10 = out[4],
	        a11 = out[5],
	        a12 = out[6],
	        a13 = out[7],
	        a20 = out[8],
	        a21 = out[9],
	        a22 = out[10],
	        a23 = out[11];

	    // Perform axis-specific matrix multiplication
	    out[4] = a10 * c + a20 * s;
	    out[5] = a11 * c + a21 * s;
	    out[6] = a12 * c + a22 * s;
	    out[7] = a13 * c + a23 * s;
	    out[8] = a20 * c - a10 * s;
	    out[9] = a21 * c - a11 * s;
	    out[10] = a22 * c - a12 * s;
	    out[11] = a23 * c - a13 * s;
	    return out;
	}

	static rotateZ(out,rad){
	    var s = Math.sin(rad),
	        c = Math.cos(rad),
	        a00 = out[0],
	        a01 = out[1],
	        a02 = out[2],
	        a03 = out[3],
	        a10 = out[4],
	        a11 = out[5],
	        a12 = out[6],
	        a13 = out[7];

	    // Perform axis-specific matrix multiplication
	    out[0] = a00 * c + a10 * s;
	    out[1] = a01 * c + a11 * s;
	    out[2] = a02 * c + a12 * s;
	    out[3] = a03 * c + a13 * s;
	    out[4] = a10 * c - a00 * s;
	    out[5] = a11 * c - a01 * s;
	    out[6] = a12 * c - a02 * s;
	    out[7] = a13 * c - a03 * s;
	    return out;
	}

	static rotate(out, rad, axis){
		var x = axis[0], y = axis[1], z = axis[2],
			len = Math.sqrt(x * x + y * y + z * z),
			s, c, t,
			a00, a01, a02, a03,
			a10, a11, a12, a13,
			a20, a21, a22, a23,
			b00, b01, b02,
			b10, b11, b12,
			b20, b21, b22;

		if (Math.abs(len) < 0.000001) { return null; }

		len = 1 / len;
		x *= len;
		y *= len;
		z *= len;

		s = Math.sin(rad);
		c = Math.cos(rad);
		t = 1 - c;

		a00 = out[0]; a01 = out[1]; a02 = out[2]; a03 = out[3];
		a10 = out[4]; a11 = out[5]; a12 = out[6]; a13 = out[7];
		a20 = out[8]; a21 = out[9]; a22 = out[10]; a23 = out[11];

		// Construct the elements of the rotation matrix
		b00 = x * x * t + c; b01 = y * x * t + z * s; b02 = z * x * t - y * s;
		b10 = x * y * t - z * s; b11 = y * y * t + c; b12 = z * y * t + x * s;
		b20 = x * z * t + y * s; b21 = y * z * t - x * s; b22 = z * z * t + c;

		// Perform rotation-specific matrix multiplication
		out[0] = a00 * b00 + a10 * b01 + a20 * b02;
		out[1] = a01 * b00 + a11 * b01 + a21 * b02;
		out[2] = a02 * b00 + a12 * b01 + a22 * b02;
		out[3] = a03 * b00 + a13 * b01 + a23 * b02;
		out[4] = a00 * b10 + a10 * b11 + a20 * b12;
		out[5] = a01 * b10 + a11 * b11 + a21 * b12;
		out[6] = a02 * b10 + a12 * b11 + a22 * b12;
		out[7] = a03 * b10 + a13 * b11 + a23 * b12;
		out[8] = a00 * b20 + a10 * b21 + a20 * b22;
		out[9] = a01 * b20 + a11 * b21 + a21 * b22;
		out[10] = a02 * b20 + a12 * b21 + a22 * b22;
		out[11] = a03 * b20 + a13 * b21 + a23 * b22;
	}

	static invert(out,mat) {
		if(mat === undefined) mat = out; //If input isn't sent, then output is also input

	    var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3],
	        a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7],
	        a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11],
	        a30 = mat[12], a31 = mat[13], a32 = mat[14], a33 = mat[15],

	        b00 = a00 * a11 - a01 * a10,
	        b01 = a00 * a12 - a02 * a10,
	        b02 = a00 * a13 - a03 * a10,
	        b03 = a01 * a12 - a02 * a11,
	        b04 = a01 * a13 - a03 * a11,
	        b05 = a02 * a13 - a03 * a12,
	        b06 = a20 * a31 - a21 * a30,
	        b07 = a20 * a32 - a22 * a30,
	        b08 = a20 * a33 - a23 * a30,
	        b09 = a21 * a32 - a22 * a31,
	        b10 = a21 * a33 - a23 * a31,
	        b11 = a22 * a33 - a23 * a32,

	        // Calculate the determinant
	        det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

	    if (!det) return false;
	    det = 1.0 / det;

	    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
	    out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
	    out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
	    out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
	    out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
	    out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
	    out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
	    out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
	    out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
	    out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
	    out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
	    out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
	    out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
	    out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
	    out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
	    out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

	    return true;
	}

	//https://github.com/toji/gl-matrix/blob/master/src/gl-matrix/mat4.js  mat4.scalar.translate = function (out, a, v) {
	static translate(out,x,y,z){
		out[12] = out[0] * x + out[4] * y + out[8]	* z + out[12];
		out[13] = out[1] * x + out[5] * y + out[9]	* z + out[13];
		out[14] = out[2] * x + out[6] * y + out[10]	* z + out[14];
		out[15] = out[3] * x + out[7] * y + out[11]	* z + out[15];
	}
}

class Transform {
  constructor() {
    this.scale = new Vector3(1, 1, 1);
    this.position = new Vector3(0, 0, 0);
    this.rotate = new Vector3(0, 0, 0);

    this.right = new Float32Array(4);
    this.up = new Float32Array(4);
    this.forward = new Float32Array(4);

    this.matrix = new Matrix4();
    this.updateDirections();
  }

  reset() {
    this.position.set(0, 0, 0);
    this.scale.set(1, 1, 1);
    this.rotate.set(0, 0, 0);

    return this;
  }

  update() {
    this.matrix
      .reset()
      .vtranslate(this.position)
      .rotateY(this.rotate.y * Math.PI / 180)
      .rotateX(this.rotate.x * Math.PI / 180)
      .rotateZ(this.rotate.z * Math.PI / 180)
      .vscale(this.scale);

    return this.updateDirections();
  }

  updateDirections() {
    Matrix4.transformVec4(this.forward, [0, 0, 1, 0], this.matrix.raw);
    Matrix4.transformVec4(this.up, [0, 1, 0, 0], this.matrix.raw);
    Matrix4.transformVec4(this.right, [1, 0, 0, 0], this.matrix.raw);

    return this;
  }

  getMatrix() {
    return this.matrix.raw;
  }
}

const m = {
  37: 'LEFT',
  38: 'UP',
  39: 'RIGHT',
  40: 'DOWN',
  87: 'W',
  65: 'A',
  83: 'S',
  68: 'D',
  32: 'SPACE'
};

const keyboard = {
  UP: false,
  DOWN: false,
  RIGHT: false,
  LEFT: false,
  SPACE: false
};

window.onkeydown = (e) => {
  keyboard[m[e.keyCode]] = true;
};

window.onkeyup = (e) => {
  keyboard[m[e.keyCode]] = false;
};

class Resources {
  static load(paths) {
    let images = {};
    let total = paths.length;
    let count = 0;

    return new Promise(resolve => {
      let handler = () => {
        count++;
        if (count >= total) {
          resolve(images);
        }
      };

      paths.forEach(path => {
        let img = new Image();
        images[path] = img;
        img.onload = handler;
        img.onerror = handler;
        img.src = path;
      });
    });
  }
}

function map(value, min, max, mMin, mMax) {
  return mMin + (mMax - mMin) * (value - min) / (max - min);
}

function createLoop(cb, fps=false) {
  let loopId = null;
  let lastTime = 0;
  let delta = 0;
  let interval = fps !== false
    ? 1000 / fps
    : 0;

  function loop(time) {
    loopId = requestAnimationFrame(loop);

    lastTime = lastTime || time;
    delta = time - lastTime;
    lastTime = time;

    cb(delta, time);
  }

  function fixLoop(time) {
    loopId = requestAnimationFrame(fixLoop);

    lastTime = lastTime || time;
    delta = time - lastTime;

    if (delta > interval) {
      cb(delta, time);
      lastTime = time;
    }
  }

  let fn = interval
    ? fixLoop
    : loop;

  return {
    start: function() {
      loopId = requestAnimationFrame(fn);
    },
    stop: function() {
      cancelAnimationFrame(loopId);
    }
  };
}


var utis = Object.freeze({
	map: map,
	createLoop: createLoop,
	Transform: Transform,
	keyboard: keyboard,
	Resources: Resources,
	Vector3: Vector3,
	Matrix4: Matrix4
});

class Model {
  constructor(geometry, material, parent, extras={}) {
    this.transform = new Transform();
    this.parent = parent;
    this.geometry = geometry;
    this.material = material;
    this.extras = Object.assign({
      cull: true,
      polygonOffset: false
    }, extras);
  }

  delete() {
    if (this.geometry) {
      this.geometry.delete();
    }
    return this;
  }

  setExtras(extras) {
    Object.assign(this.extras, extras);
    return this;
  }

  setRotate(x, y, z) {
    this.transform.rotate.set(x, y, z);
    return this;
  }

  setTranslate(x, y, z) {
    this.transform.position.set(x, y, z);
    return this;
  }

  setScale(x, y, z) {
    this.transform.scale.set(x, y, z);
    return this;
  }

  rotate(x, y, z) {
    this.transform.rotate.x += x;
    this.transform.rotate.y += y;
    this.transform.rotate.z += z;

    return this;
  }

  translate(x, y, z) {
    this.transform.position.x += x;
    this.transform.position.y += y;
    this.transform.position.z += z;

    return this;
  }

  scale(x, y, z) {
    this.transform.scale.x *= x;
    this.transform.scale.y *= y;
    this.transform.scale.z *= z;

    return this;
  }

  /**
   * Move the model in the left/right direction from the current point of view.
   * @param  {Number} v displacement amount
   * @return {Camera} this, chainable
   */
  panX(v) {
    return this.translate(
      this.transform.right[0] * v,
      this.transform.right[1] * v,
      this.transform.right[2] * v
    );
  }

  /**
   * Move the model in the up/down direction from the current point of view.
   * @param  {Number} v displacement amount
   * @return {Camera} this, chainable
   */
  panY(v) {
    return this.translate(
      this.transform.up[0] * v,
      this.transform.up[1] * v,
      this.transform.up[2] * v
    );
  }

  /**
   * Move the model in the forward/backward direction from
   * the current point of view.
   * @param  {Number} v displacement amount
   * @return {Camera} this, chainable
   */
  panZ(v) {
    return this.translate(
      this.transform.forward[0] * v,
      this.transform.forward[1] * v,
      this.transform.forward[2] * v
    );
  }

  update() {
    this.transform.update();
    return this;
  }

  getMatrix() {
    return this.parent
      ? Matrix4.mult(new Float32Array(16), this.parent.getMatrix(), this.transform.getMatrix())
      : this.transform.getMatrix();
  }

  getNormalMatrix() {
    return Matrix4.normalMat3(new Float32Array(9), this.getMatrix());
  }
}

/**
 * Representation of a camera, provides view and projection matrices.
 * @type {Camera}
 */
class Camera extends Model {
  constructor() {
    super();
    this.projMatrix = Matrix4.identity();
  }

  /**
   * Gets the projection matrix
   * @return {Float32Array} 4x4 view matrix
   */
  getProjMatrix() {
    return this.projMatrix;
  }

  /**
   * Gets the view matrix
   * @return {Float32Array} 4x4 view matrix
   */
  getViewMatrix() {
    let mat = new Float32Array(16);
    Matrix4.invert(mat, super.getMatrix());

    return mat;
  }
}

class Perspective extends Camera {
  constructor(fov, ratio, near, far) {
    super();
    this.updatePerspective(fov, ratio, near, far);
  }

  /**
   * Update the values for the perspective projection matrix
   * @param  {Numger} fov   field of view, expressed in radians.
   * @param  {Numger} ratio ratio, usually width / height.
   * @param  {Numger} near  near plane
   * @param  {Numger} far   far plane
   * @return {Camera} this, chainable
   */
  updatePerspective(fov, ratio, near, far) {
    this.fov = fov;
    this.ratio = ratio;
    this.pNear = near;
    this.pFar = far;
    this.updateProjection = true;

    return this;
  }

  /**
   * Get the perspective projection matrix.
   * @return {Float32Array} 4x4 perspective matrix
   */
  getProjMatrix() {
    if (this.updateProjection) {
      Matrix4.perspective(
        this.projMatrix,
        this.fov,
        this.ratio,
        this.pNear,
        this.pFar
      );
      this.updateProjection = false;
    }

    return super.getProjMatrix();
  }
}

class Ortho extends Camera {
  constructor(left, right, bottom, top, near, far) {
    super();
    this.updateOrtho(left, right, bottom, top, near, far);
  }

  /**
   * Updates the values for the ortho projection matrix.
   *
   * @param  {Number} left
   * @param  {Number} right
   * @param  {Number} bottom
   * @param  {Number} top
   * @param  {Number} near
   * @param  {Number} far
   * @return {Camera} this, chainable
   */
  updateOrtho(left, right, bottom, top, near, far) {
    this.oNear = near;
    this.oFar = far;
    this.left = left;
    this.right = right;
    this.top = top;
    this.bottom = bottom;
    this.updateProjection = true;

    return this;
  }

  /**
   * Get the ortho projection matrix.
   * @return {Float32Array} 4x4 ortho matrix
   */
   getProjMatrix() {
     if (this.updateProjection) {
       Matrix4.ortho(
         this.projMatrix,
         this.left,
         this.right,
         this.bottom,
         this.top,
         this.oNear,
         this.oFar
       );

       this.updateProjection = false;
     }

     return super.getProjMatrix();
   }

}



var cams = Object.freeze({
	Camera: Camera,
	Perspective: Perspective,
	Ortho: Ortho
});

class Arrows {
  constructor(model) {
    this.model = model;
  }

  /**
   * Updates the model position with basic arrow controls.
   * @param  {Number} [delta=0] ms since last update
   */
  update(delta=0) {
    let vel = 5;
    let moveVector = {
      z: (keyboard.S ? 1 : 0) + (keyboard.W ? -1 : 0),
      x: (keyboard.A ? -1 : 0) + (keyboard.D ? 1 : 0)
    };

    let rotateVector = {
      y: (keyboard.LEFT ? 1 : 0) + (keyboard.RIGHT ? -1 : 0),
      x: (keyboard.DOWN ? -1 : 0) + (keyboard.UP ? 1 : 0)
    };

    this.model
      .panX(vel * moveVector.x * delta / 1000)
      .panZ(vel * moveVector.z * delta / 1000)
      .rotate(
        360 * rotateVector.x * delta / 1000,
        360 * rotateVector.y * delta / 1000,
        0)
      .update();
  }
}



var ctrls = Object.freeze({
	Arrows: Arrows
});

const LOCATIONS = {};
let lastLocation = 0;

function getTextureLocation(name) {
  if (LOCATIONS[name] === undefined) {
    return false;
  }

  return LOCATIONS[name];
}

function loadTexture(gl, image, name) {
  let texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0 + lastLocation);
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);


  let mipLevel = 0;
  let internalFormat = gl.RGBA;
  let srcFormat = gl.RGBA;
  let srcType = gl.UNSIGNED_BYTE;
  gl.texImage2D(
    gl.TEXTURE_2D,
    mipLevel,
    internalFormat,
    srcFormat,
    srcType,
    image
  );

  gl.generateMipmap(gl.TEXTURE_2D);

  LOCATIONS[name] = lastLocation;
  lastLocation++;

  return LOCATIONS[name];
}

function toCamelCase(str) {
  let s = str.charAt(0).toUpperCase() + str.slice(1);
  return s.replace(/^([A-Z])|[\s-_](\w)/g, function(match, p1, p2, offset) {
    if (p2) return p2.toUpperCase();
    return p1.toUpperCase();
  });
}

function getUniformSetterByType(type, loc) {
  if (type == 'vec2') {
    return function(gl, data) {
      gl.uniform2fv(loc, data);
    }
  }

  if (type == 'vec3') {
    return function(gl, data) {
      gl.uniform3fv(loc, data);
    }
  }

  if (type == 'vec4') {
    return function(gl, data) {
      gl.uniform4fv(loc, data);
    }
  }

  if (type == 'mat4') {
    return function(gl, data) {
      gl.uniformMatrix4fv(loc, false, data);
    }
  }

  if (type == 'mat3') {
    return function(gl, data) {
      gl.uniformMatrix3fv(loc, false, data);
    }
  }

  if (type == 'float') {
    return function(gl, data) {
      gl.uniform1f(loc, data);
    }
  }

  if (type == 'bool') {
    return function(gl, data) {
      gl.uniform1i(loc, data);
    }
  }

  if (type == 'sampler2D') {
    return function(gl, image, name) {
      let tLoc = getTextureLocation(name);
      if (tLoc === false) {
        tLoc = loadTexture(gl, image, name);
      }
      gl.uniform1i(loc, tLoc);
    }
  }
}

function setUpShaderUniform(gl, shader, uniform) {
  let {type, count} = uniform;

  if (count) {
    setUpShaderArrayUniform(gl, shader, uniform);
  } else if (shader.customTypes.indexOf(type) !== -1) {
    setUpShaderStructUniform(gl, shader, uniform);
  } else {
    setUpShaderFlatUniform(gl, shader, uniform);
  }
}

function setUpShaderFlatUniform(gl, shader, uniform) {
  let loc = gl.getUniformLocation(shader.id, uniform.name);
  shader.locations.uniforms[uniform.name] = loc;

  shader[`set${toCamelCase(uniform.name)}`] = (gl, data) => {
    getUniformSetterByType(uniform.type, loc)(gl, data);
    return shader;
  };
}

function setUpShaderStructUniform(gl, shader, uniform) {
  shader.locations.uniforms[uniform.name] = {};
  let fields = shader.structs[uniform.type].fields.map(({name, type}) => {
    let loc = gl.getUniformLocation(shader.id, `${uniform.name}.${name}`);
    shader.locations.uniforms[uniform.name][name] = loc;
    return {
      loc,
      name,
      type
    };
  });

  shader[`set${toCamelCase(uniform.name)}`] = (gl, data) => {
    fields.forEach(f => {
      getUniformSetterByType(f.type, f.loc)(gl, data[f.name]);
    });
    return shader;
  };
}

function setUpShaderArrayUniform(gl, shader, uniform) {
  if (shader.customTypes.indexOf(uniform.type) !== -1) {
    let fields = [];
    shader.locations.uniforms[uniform.name] = {};
    shader.structs[uniform.type].fields.forEach(({name, type}) => {
      for (let i = 0; i < uniform.count; i++) {
        let loc = gl.getUniformLocation(shader.id, `${uniform.name}[${i}].${name}`);
        shader.locations.uniforms[uniform.name][name] = loc;
        fields.push({
          loc,
          name,
          type,
          index: i
        });
      }
    });


    shader[`set${toCamelCase(uniform.name)}`] = (gl, data) => {
      data.forEach((d, i) => {
        fields.filter(f => f.index === i).forEach(f => {
          getUniformSetterByType(f.type, f.loc)(gl, d[f.name]);
        });
      });
      return shader;
    };
  } else {
    let locs = Array(uniform.count).fill(0).map((_, i) => {
      return gl.getUniformLocation(shader.id, `${uniform.name}[${i}]`);
    });

    shader[`set${toCamelCase(uniform.name)}`] = (gl, data) => {
      data.forEach((d, i) => {
        getUniformSetterByType(uniform.type, locs[i])(gl, d);
      });
      return shader;
    };
  }
}

function getShaderSrc({structs, inputs, uniforms, outputs, functions}) {
  let ins = inputs.reduce((p, i) => p + `${i.flat ? 'flat in':'in'} ${i.type} ${i.name}; \n`, '');
  let unis = uniforms.reduce((p, u) => {
    return u.count
      ? p + `uniform ${u.type} ${u.name}[${u.count}]; \n`
      : p + `uniform ${u.type} ${u.name}; \n`;
  }, '');
  let outs = outputs.reduce((p, o) => p + `${o.flat ? 'flat out':'out'} ${o.type} ${o.name}; \n`, '');
  let funcs = functions.reduce((p, f) => p + `${f} \n`, '');
  let strcts = Object.values(structs).reduce((p, s) => {
    return p + `struct ${s.name} {
      ${s.fields.map(f => `${f.type} ${f.name};`).join('\n')}
    }; \n`
  }, '');

  return `#version 300 es
    precision mediump float;
    ${strcts}
    ${ins}
    ${unis}
    ${outs}
    ${funcs}
  `;
}

function shaderFromSrc(gl, type, src, debug) {
  let shader = gl.createShader(type);
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (debug) {
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error("Error compiling shader: " + src, gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return;
    }
  }
  return shader;
}

const SHADERS = {};

class Shader {
  static create(name) {
    let shader = new Shader(name);
    SHADERS[name] = shader;
    return shader;
  }

  static delete(name) {
    SHADERS[name].delete();
  }

  static program(gl, name, debug) {
    let shader = SHADERS[name];

    if (!shader) {
      return;
    }

    if (shader.id !== null) {
      return shader;
    }

    let vSrc = getShaderSrc(Object.assign(shader.data.vertex, {structs: shader.structs}));
    let fSrc = getShaderSrc(Object.assign(shader.data.fragment, {structs: shader.structs}));
    let vShader = shaderFromSrc(gl, gl.VERTEX_SHADER, vSrc, debug);
    let fShader = shaderFromSrc(gl, gl.FRAGMENT_SHADER, fSrc, debug);

    shader.id = gl.createProgram();
    gl.attachShader(shader.id, vShader);
    gl.attachShader(shader.id, fShader);

    shader.data.vertex.inputs.forEach(({name}, i) => {
      gl.bindAttribLocation(shader.id, i, name);
      shader.locations.attribs[name] = i;
    });

    gl.linkProgram(shader.id);

    if (debug) {
      if (!gl.getProgramParameter(shader.id, gl.LINK_STATUS)) {
        var info =
        console.error(`
          Could not compule WebGL program.
          ${gl.getProgramInfoLog(shader.id)}
        `);
        return;
      }
    }

    gl.detachShader(shader.id, vShader);
    gl.detachShader(shader.id, fShader);
    gl.deleteShader(vShader);
    gl.deleteShader(fShader);

    shader.data.vertex.uniforms.forEach(u => {
      setUpShaderUniform(gl, shader, u);
    });

    shader.data.fragment.uniforms.forEach(u => {
      setUpShaderUniform(gl, shader, u);
    });

    return shader;
  }

  constructor(name) {
    this.name = name;
    this.id = null;
    this.locations = {
      uniforms: {},
      attribs: {}
    };

    this.customTypes = [];
    this.structs = {};

    this.data = {
      vertex: {
        inputs: [],
        uniforms: [],
        outputs: [],
        functions: []
      },
      fragment: {
        inputs: [],
        uniforms: [],
        outputs: [],
        functions: []
      }
    };

    this.activeShader = null;
    this._materialHandler = () => {};
  }

  defaults() {
    return this
      .vertex()
        .addInput({name: 'a_position', type: 'vec3'})
        .addInput({name: 'a_normal', type: 'vec3'})
        .addInput({name: 'a_texture', type: 'vec3'})
        .addUniform({name: 'u_proj', type: 'mat4'})
        .addUniform({name: 'u_view', type: 'mat4'})
        .addUniform({name: 'u_model', type: 'mat4'})
        .addUniform({name: 'u_normal', type: 'mat3'})
      .fragment()
        .addOutput({name: 'final_color', type: 'vec4'})
  }

  materialHandler(f) {
    this._materialHandler = f;
  }

  bindMaterial(gl, material) {
    this._materialHandler(this, gl, material);
    return this;
  }

  vertex() {
    this.activeShader = 'vertex';
    return this;
  }

  fragment() {
    this.activeShader = 'fragment';
    return this;
  }

  addStruct({name, fields}) {
    this.customTypes.push(name);
    this.structs[name] = {name, fields};
    return this;
  }

  addInput({flat, type, name}) {
    this.data[this.activeShader].inputs.push({type, name, flat});
    return this;
  }

  addOutput({flat, type, name}) {
    this.data[this.activeShader].outputs.push({type, name, flat});
    return this;
  }

  addUniform({type, name, count}) {
    this.data[this.activeShader].uniforms.push({type, name, count});
    return this;
  }

  addFunction(f) {
    this.data[this.activeShader].functions.push(f);
    return this;
  }

  activate(gl) {
    gl.useProgram(this.id);
    return this;
  }

  deactivate(gl) {
    gl.useProgram(null);
    return this;
  }

  renderGeometry(gl, {vao, mode, indexLength, vertexCount}) {
    gl.bindVertexArray(vao);
    if (indexLength) {
      gl.drawElements(mode, indexLength, gl.UNSIGNED_SHORT, 0);
    } else {
      gl.drawArrays(mode, 0, vertexCount);
    }
    gl.bindVertexArray(null);

    return this;
  }

  renderModel(gl, model) {
    let geoInfo = model.geometry.renderInfo(gl);

    return this.renderGeometry(gl, geoInfo);
  }

  delete() {
    this.id = null;
    return this;
  }
}

class VAO {
  static create() {
    return new VAO();
  }

  renderInfo(gl) {
    if (this.info === null) {
      let vertexCount = null;
      let indexLength = null;
      let vao = gl.createVertexArray();
      gl.bindVertexArray(vao);

      let buf;
      this.attribs.forEach(attr => {
        buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(attr.data), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(attr.location);
        gl.vertexAttribPointer(attr.location, attr.componentLen, gl.FLOAT, attr.normalize, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        vertexCount = attr.data.length / attr.componentLen;
      });

      if (this.indexes) {
        buf = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buf);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indexes), gl.STATIC_DRAW);
        indexLength = this.indexes.length;
      }

      gl.bindVertexArray(null);

      this.info = {
        mode: gl[this.mode],
        vao: vao,
        indexLength: indexLength,
        vertexCount: vertexCount
      };
    }

    return this.info;
  }

  constructor(name) {
    this.name = name;
    this.mode = null;
    this.attribs = [];
    this.indexes = null;
    this.info = null;
  }

  setMode(mode) {
    this.mode = mode;
    return this;
  }

  addAttrib({data, componentLen, location, normalize=false}) {
    this.attribs.push({
      data,
      normalize,
      componentLen,
      location
    });
    return this;
  }

  setIndexes(data) {
    this.indexes = data;
    return this;
  }

  delete() {
    this.info = null;
    return this;
  }
}



var shades = Object.freeze({
	Shader: Shader,
	Vao: VAO
});

function raw(range) {
  return {
    vertices: [
      range.x[0],  0.0,  0.0,
      range.x[1],  0.0,  0.0,
       0.0,  range.y[0],  0.0,
       0.0,  range.y[1],  0.0,
       0.0,  0.0,  range.z[0],
       0.0,  0.0,  range.z[1]
    ],
    colors: [
      1.0, 0.0, 0.0,
      1.0, 0.0, 0.0,
      0.0, 1.0, 0.0,
      0.0, 1.0, 0.0,
      0.0, 0.0, 1.0,
      0.0, 0.0, 1.0
    ],
    indexes: [
      0, 1,
      2, 3,
      4, 5
    ]
  };
}

function axis(range={
  x: [-1.0, 1.0],
  y: [-1.0, 1.0],
  z: [-1.0, 1.0]
}) {
  let data = raw(range);

  return VAO
    .create()
    .setMode('LINES')
    .addAttrib({
      data: data.vertices,
      componentLen: 3,
      location: 0
    })
    .addAttrib({
      data: data.colors,
      componentLen: 3,
      location: 2
    })
    .setIndexes(data.indexes);
}

axis.raw = raw;

function raw$1(range=[-10, 10], size=0.1) {
  let vertices = [];
  for (let i = range[0]; i <= range[1]; i+=size) {
    vertices = vertices
      .concat([i, 0.0, range[0]])
      .concat([i, 0.0, range[1]])
      .concat([range[0], 0.0, i])
      .concat([range[1], 0.0, i]);
  }

  return {
    vertices
  };
}

function grid(range=[-10, 10], size=0.1) {
  let data = raw$1(range, size, color);

  return VAO
    .create()
    .setMode('LINES')
    .addAttrib({
      data: data.vertices,
      componentLen: 3,
      location: 0
    });
}

const TOP    = 0;
const BOTTOM = 1;
const RIGHT  = 2;
const LEFT   = 3;
const FRONT  = 4;
const BACK   = 5;
const ALL = 6;

const FACES = {
  [TOP]: {
    vertices: [
      -0.5,  0.5, -0.5,
       0.5,  0.5, -0.5,
      -0.5,  0.5,  0.5,
       0.5,  0.5,  0.5,
    ],
    normals: [
      0.0, 1.0, 0.0,
      0.0, 1.0, 0.0,
      0.0, 1.0, 0.0,
      0.0, 1.0, 0.0,
    ],
    indexes: [
      0, 2, 3,
      0, 3, 1
    ]
  },
  [BOTTOM]: {
    vertices: [
       0.5, -0.5, -0.5,
      -0.5, -0.5, -0.5,
       0.5, -0.5,  0.5,
      -0.5, -0.5,  0.5,
    ],
    normals: [
      0.0, -1.0, 0.0,
      0.0, -1.0, 0.0,
      0.0, -1.0, 0.0,
      0.0, -1.0, 0.0,
    ],
    indexes: [
      0, 2, 3,
      0, 3, 1
    ]
  },
  [BACK]: {
    vertices: [
       0.5,  0.5, -0.5,
      -0.5,  0.5, -0.5,
       0.5, -0.5, -0.5,
      -0.5, -0.5, -0.5,
    ],
    normals: [
      0.0, 0.0, -1.0,
      0.0, 0.0, -1.0,
      0.0, 0.0, -1.0,
      0.0, 0.0, -1.0,
    ],
    indexes: [
      0, 2, 3,
      0, 3, 1
    ]
  },
  [FRONT]: {
    vertices: [
      -0.5,  0.5, 0.5,
       0.5,  0.5, 0.5,
      -0.5, -0.5, 0.5,
       0.5, -0.5, 0.5,
    ],
    normals: [
      0.0, 0.0, 1.0,
      0.0, 0.0, 1.0,
      0.0, 0.0, 1.0,
      0.0, 0.0, 1.0,
    ],
    indexes: [
      0, 2, 3,
      0, 3, 1
    ]
  },
  [LEFT]: {
    vertices: [
      -0.5,  0.5, -0.5,
      -0.5,  0.5,  0.5,
      -0.5, -0.5, -0.5,
      -0.5, -0.5,  0.5,
    ],
    normals: [
      -1.0, 0.0, 0.0,
      -1.0, 0.0, 0.0,
      -1.0, 0.0, 0.0,
      -1.0, 0.0, 0.0,
    ],
    indexes: [
      0, 2, 3,
      0, 3, 1
    ]
  },
  [RIGHT]: {
    vertices: [
      0.5,  0.5,  0.5,
      0.5,  0.5, -0.5,
      0.5, -0.5,  0.5,
      0.5, -0.5, -0.5,
    ],
    normals: [
      1.0, 0.0, 0.0,
      1.0, 0.0, 0.0,
      1.0, 0.0, 0.0,
      1.0, 0.0, 0.0,
    ],
    indexes: [
      0, 2, 3,
      0, 3, 1,
    ]
  }
};

function raw$2(size, faces) {
  if (faces === ALL) {
    faces = [TOP, BOTTOM, RIGHT, LEFT, FRONT, BACK];
  }

  return faces
    .map(f => FACES[f])
    .reduce((p, d) => {
      let offset = Math.floor(p.vertices.length / 3);
      return {
        vertices: p.vertices.concat(d.vertices.map(v => v * size)),
        normals: p.normals.concat(d.normals.slice()),
        indexes: p.indexes.concat(d.indexes.map(i => i + offset))
      };
    }, {
      vertices: [],
      normals: [],
      indexes: []
    });
}

function cube(size=1.0, faces=ALL) {
  let data = raw$2(size, faces);

  return VAO
    .create()
    .setMode('TRIANGLES')
    .addAttrib({
      data: data.vertices,
      componentLen: 3,
      location: 0
    })
    .addAttrib({
      data: data.normals,
      componentLen: 3,
      location: 1
    })
    .setIndexes(data.indexes);
}

cube.raw = raw$2;
cube.TOP    = TOP;
cube.BOTTOM = BOTTOM;
cube.RIGHT  = RIGHT;
cube.LEFT   = LEFT;
cube.FRONT  = FRONT;
cube.BACK   = BACK;
cube.ALL    = ALL;

function raw$3(r=1.0, d=36) {
  let ai, si, ci;
  let aj, sj, cj;
  let p1, p2;
  let vertices = [];
  let normals = [];
  let indexes = [];

  for (let j = 0; j <= d; j++) {
    aj = j * Math.PI / d;
    sj = Math.sin(aj);
    cj = Math.cos(aj);
    for (let i = 0; i <= d; i++) {
      ai = i * 2 * Math.PI / d;
      si = Math.sin(ai);
      ci = Math.cos(ai);

      vertices.push(r * si * sj);
      vertices.push(r * cj);
      vertices.push(r * ci * sj);

      normals.push(si * sj);
      normals.push(cj);
      normals.push(ci * sj);
    }
  }

  for (let j = 0; j < d; j++) {
    for (let i = 0; i < d; i++) {
      p1 = j * (d+1) + i;
      p2 = p1 + (d+1);

      indexes.push(p1);
      indexes.push(p2);
      indexes.push(p1 + 1);

      indexes.push(p1 + 1);
      indexes.push(p2);
      indexes.push(p2 + 1);
    }
  }

  return {
    vertices,
    normals,
    indexes
  };
}

function sphere(r=1.0, d=36) {
  let data = raw$3(r, d);
  return VAO
    .create()
    .setMode('TRIANGLES')
    .addAttrib({
      data: data.vertices,
      componentLen: 3,
      location: 0
    })
    .addAttrib({
      data: data.normals,
      componentLen: 3,
      location: 1
    })
    .setIndexes(data.indexes);
}

sphere.raw = raw$3;

const vertices = [
  -0.5,  0.5, 0.0,
   0.5,  0.5, 0.0,
  -0.5, -0.5, 0.0,
   0.5, -0.5, 0.0,
];

const normals = [
  0.0, 0.0, 1.0,
  0.0, 0.0, 1.0,
  0.0, 0.0, 1.0,
  0.0, 0.0, 1.0,
];

const indexes = [
  0, 2, 3,
  0, 3, 1
];

function raw$4(size=1.0) {
  return {
    vertices: vertices.map(v => v * size),
    normals: normals.slice(),
    indexes: indexes.slice()
  };
}

function quad(size=1.0) {
  let data = raw$4(size);
  return VAO
    .create()
    .setMode('TRIANGLES')
    .addAttrib({
      data: data.vertices,
      componentLen: 3,
      location: 0
    })
    .addAttrib({
      data: data.normals,
      componentLen: 3,
      location: 1
    })
    .setIndexes(data.indexes);
}

quad.raw = raw$4;

const vertices$1 = [
  -0.5, -0.5, 0.0,
   0.5, -0.5, 0.0,
   0.0,  0.5, 0.0,
];

const normals$1 = [
  0.0, 0.0, 1.0,
  0.0, 0.0, 1.0,
  0.0, 0.0, 1.0,
];

function raw$5(size=1.0) {
  return {
    vertices: vertices$1.map(v => v * size),
    normals: normals$1.slice()
  };
}

function triangle(size=1.0) {
  let data = raw$5(size);
  return VAO
    .create()
    .setMode('TRIANGLES')
    .addAttrib({
      data: data.vertices,
      componentLen: 3,
      location: 0
    })
    .addAttrib({
      data: data.normals,
      componentLen: 3,
      location: 1
    });
}

triangle.raw = raw$5;

const TOP$1 = [0.0, 0.5, 0.0];
const BASE = [
  [-0.5,  -0.5, -0.5],
  [-0.5,  -0.5,  0.5],
  [ 0.5,  -0.5,  0.5],
  [ 0.5,  -0.5, -0.5]
];

function raw$6(size=1.0) {
  let top = TOP$1.map(v => v * size);
  let base = BASE.map(v => v.map(c => c * size));

  let vertices = [];
  let normals = [];
  let indexes = [];

  base.forEach((v, i) => {
    let offset = vertices.length / 3;
    let v0 = top.slice();
    let v1 = v.slice();
    let v2 = base[(base.length + i + 1) % base.length].slice();
    let e1 = v1.map((v, i) => { return v - v0[i] });
    let e2 = v2.map((v, i) => { return v - v0[i] });
    let c = Vector3.cross([], e1, e2);
    let normal = new Vector3(c[0], c[1], c[2]).normalize();


    vertices = vertices.concat(v0);
    vertices = vertices.concat(v1);
    vertices = vertices.concat(v2);

    for (let i = 0; i < 3; i++) {
      normals.push(normal.x);
      normals.push(normal.y);
      normals.push(normal.z);
    }

    indexes.push(0 + offset);
    indexes.push(1 + offset);
    indexes.push(2 + offset);
  });

  let offset = vertices.length / 3;
  vertices = vertices.concat(base.reduce((p, v) => p.concat(v), []));

  for (let i = 0; i < 4; i++) {
    normals.push(0.0);
    normals.push(-1.0);
    normals.push(0.0);
  }

  indexes.push(0 + offset);
  indexes.push(2 + offset);
  indexes.push(1 + offset);

  indexes.push(0 + offset);
  indexes.push(3 + offset);
  indexes.push(2 + offset);

  return {
    vertices,
    normals,
    indexes
  };
}

function pyramid(size=1.0) {
  let data = raw$6(size);
  return VAO
    .create()
    .setMode('TRIANGLES')
    .addAttrib({
      data: data.vertices,
      componentLen: 3,
      location: 0
    })
    .addAttrib({
      data: data.normals,
      componentLen: 3,
      location: 1
    })
    .setIndexes(data.indexes);
}

pyramid.raw = raw$6;

function raw$7(r=1.0, d=36) {
  let vertices = [0.0, 0.0, 0.0];
  let normals  = [0.0, 0.0, 1.0];
  let s = 2 * Math.PI / d;

  for (let i = 0; i <= d; i++){
    vertices.push(r * Math.cos(s * i));
    vertices.push(r * Math.sin(s * i));
    vertices.push(0.0);
    normals.push(0.0);
    normals.push(0.0);
    normals.push(1.0);
  }

  return {
    vertices,
    normals
  };
}


function circle(r=1.0, d=36) {
  let data = raw$7(r, d);
  return VAO
    .create()
    .setMode('TRIANGLE_FAN')
    .addAttrib({
      data: data.vertices,
      componentLen: 3,
      location: 0
    })
    .addAttrib({
      data: data.normals,
      componentLen: 3,
      location: 1
    });
}

circle.raw = raw$7;



var prims = Object.freeze({
	axis: axis,
	grid: grid,
	cube: cube,
	sphere: sphere,
	quad: quad,
	triangle: triangle,
	pyramid: pyramid,
	circle: circle
});

const BASIC_SHADER = 'basic';

Shader
  .create(BASIC_SHADER)
  .defaults()
  .vertex()
    .addFunction(`
      void main(void) {
        vec4 world_coord = u_model * vec4(a_position, 1.0);
        gl_Position = u_proj * u_view * world_coord;
      }
    `)
  .fragment()
    .addUniform({name: 'u_color', type: 'vec3'})
    .addFunction(`
      void main(void) {
        final_color = vec4(u_color, 1.0);
      }
    `)
  .materialHandler((shader, gl, material) => {
    shader.setUColor(gl, material.color);
  });


function basic(color) {
  return {
    type: BASIC_SHADER,
    color
  };
}

const NORMAL_SHADER = 'normal';

Shader
  .create(NORMAL_SHADER)
  .defaults()
  .vertex()
    .addOutput({name: 'normal', type: 'vec3'})
    .addFunction(`
      void main(void) {
        gl_Position = u_proj * u_view * u_model * vec4(a_position, 1.0);
        normal = u_normal * a_normal;
      }
    `)
  .fragment()
    .addInput({name: 'normal', type: 'vec3'})
    .addUniform({name: 'u_color', type: 'vec3'})
    .addFunction(`
      void main(void) {
        vec3 n = normalize(normal);
        final_color = vec4(vec3(1.0, 1.0, 1.0) - n / 3.0, 1.0);
      }
    `);


function normal() {
  return {
    type: NORMAL_SHADER
  };
}

const DIFFUSE_SHADER = 'diffuse';

Shader
  .create(DIFFUSE_SHADER)
  .defaults()
  .addStruct({name: 'a_light', fields: [
    {name: 'color', type: 'vec3'},
    {name: 'attenuation', type: 'float'}
  ]})
  .addStruct({name: 'd_light', fields: [
    {name: 'direction', type: 'vec3'},
    {name: 'color', type: 'vec3'}
  ]})
  .addStruct({name: 'p_light', fields: [
    {name: 'position', type: 'vec3'},
    {name: 'color', type: 'vec3'},
    {name: 'attenuation', type: 'float'}
  ]})
  .vertex()
    .addOutput({name: 'normal', type: 'vec3'})
    .addOutput({name: 'position', type: 'vec3'})
    .addFunction(`
      void main(void) {
        vec4 world_coord = u_model * vec4(a_position, 1.0);
        gl_Position = u_proj * u_view * world_coord;
        normal = u_normal * a_normal;
        position = world_coord.xyz;
      }
    `)
  .fragment()
    .addInput({name: 'normal', type: 'vec3'})
    .addInput({name: 'position', type: 'vec3'})
    .addUniform({name: 'u_color', type: 'vec3'})
    .addUniform({name: 'u_a_light', type: 'a_light'})
    .addUniform({name: 'u_d_lights', type: 'd_light', count: 5})
    .addUniform({name: 'u_p_lights', type: 'p_light', count: 5})
    .addFunction(`
      vec3 directional_light(vec3 normal, vec3 color, d_light light) {
        float coeficient = dot(normalize(normal), normalize(light.direction));
        return max(0.0, coeficient) * color * light.color;
      }
    `)
    .addFunction(`
      vec3 point_light(vec3 position, vec3 normal, vec3 color, p_light light) {
        vec3 n_normal = normalize(normal);
        vec3 to_point = light.position - position;
        float p_coeficient = dot(n_normal, normalize(to_point));
        vec3 p_diffuse = max(0.0, p_coeficient) * color * light.color;
        float attenuation = 1.0 / (1.0 + light.attenuation * pow(length(to_point), 2.0));
        return attenuation * p_diffuse;
      }
    `)
    .addFunction(`
      void main(void) {
        vec3 directional = vec3(0.0, 0.0, 0.0);
        vec3 point = vec3(0.0, 0.0, 0.0);
        vec3 ambient = u_a_light.attenuation * u_color.rgb * u_a_light.color;

        for (int i=0; i < 5; ++i) {
          directional += directional_light(normal, u_color, u_d_lights[i]);
        }

        for (int i=0; i < 5; ++i) {
          point += point_light(position, normal, u_color, u_p_lights[i]);
        }

        final_color = vec4(ambient + directional + point, 1.0);
      }
    `)
  .materialHandler((shader, gl, material) => {
    shader.setUColor(gl, material.color);
  });


function diffuse(color) {
  return {
    type: DIFFUSE_SHADER,
    color
  };
}

const PHONG_SHADER = 'phong';

Shader
  .create(PHONG_SHADER)
  .defaults()
  .addStruct({name: 'a_light', fields: [
    {name: 'color', type: 'vec3'},
    {name: 'attenuation', type: 'float'}
  ]})
  .addStruct({name: 'd_light', fields: [
    {name: 'direction', type: 'vec3'},
    {name: 'color', type: 'vec3'}
  ]})
  .addStruct({name: 'p_light', fields: [
    {name: 'position', type: 'vec3'},
    {name: 'color', type: 'vec3'},
    {name: 'attenuation', type: 'float'}
  ]})
  .vertex()
    .addOutput({name: 'normal', type: 'vec3'})
    .addOutput({name: 'position', type: 'vec3'})
    .addFunction(`
      void main(void) {
        vec4 world_coord = u_model * vec4(a_position, 1.0);
        gl_Position = u_proj * u_view * world_coord;
        normal = u_normal * a_normal;
        position = world_coord.xyz;
      }
    `)
  .fragment()
    .addInput({name: 'normal', type: 'vec3'})
    .addInput({name: 'position', type: 'vec3'})
    .addUniform({name: 'u_camera', type: 'vec3'})
    .addUniform({name: 'u_color', type: 'vec3'})
    .addUniform({name: 'u_shininess', type: 'float'})
    .addUniform({name: 'u_specular_color', type: 'vec3'})
    .addUniform({name: 'u_a_light', type: 'a_light'})
    .addUniform({name: 'u_d_lights', type: 'd_light', count: 5})
    .addUniform({name: 'u_p_lights', type: 'p_light', count: 5})
    .addFunction(`
      vec3 directional_light(vec3 normal, vec3 color, d_light light) {
        float coeficient = dot(normalize(normal), normalize(light.direction));
        return max(0.0, coeficient) * color * light.color;
      }
    `)
    .addFunction(`
      vec3 point_light(vec3 position, vec3 normal, vec3 color, vec3 camera, p_light light) {
        vec3 n_normal = normalize(normal);
        vec3 to_point = light.position - position;
        float attenuation = 1.0 / (1.0 + light.attenuation * pow(length(to_point), 2.0));
        to_point = normalize(to_point);

        float p_coeficient = dot(n_normal, to_point);
        vec3 p_diffuse = max(0.0, p_coeficient) * color.rgb * light.color;

        float s_coeficient = 0.0;
        if (p_coeficient > 0.0 && u_shininess > 1.0) {
          vec3 reflection_vector = reflect(-to_point, n_normal);
          vec3 to_camera = normalize(camera - position);
          s_coeficient = max(0.0, dot(to_camera, reflection_vector));
          s_coeficient = pow(s_coeficient, u_shininess);
        }
        vec3 p_specular = s_coeficient * u_specular_color * light.color;

        return attenuation * (p_diffuse + p_specular);
      }
    `)
    .addFunction(`
      void main(void) {
        vec3 directional = vec3(0.0, 0.0, 0.0);
        vec3 point = vec3(0.0, 0.0, 0.0);
        vec3 ambient = u_a_light.attenuation * u_color.rgb * u_a_light.color;

        for (int i=0; i < 5; ++i) {
          directional += directional_light(normal, u_color, u_d_lights[i]);
        }

        for (int i=0; i < 5; ++i) {
          point += point_light(position, normal, u_color, u_camera, u_p_lights[i]);
        }

        final_color = vec4(ambient + directional + point, 1.0);
      }
    `)
  .materialHandler((shader, gl, material) => {
    shader.setUColor(gl, material.color);
    shader.setUShininess(gl, material.shininess);
    shader.setUSpecularColor(gl, material.specularColor);
  });


function phong(color, shininess, specularColor) {
  return {
    type: PHONG_SHADER,
    color,
    shininess,
    specularColor
  };
}



var mats = Object.freeze({
	basic: basic,
	normal: normal,
	diffuse: diffuse,
	phong: phong
});

class Point extends Model {
  constructor({color, attenuation, parent, geometry, material}) {
    if (!geometry) {
      geometry = sphere(1.0, 8);
    }

    if (!material) {
      material = basic(color);
    }

    super(geometry, material, parent);
    this.color = color;
    this.attenuation = attenuation;
  }

  get position() {
    return [
      this.transform.position.x,
      this.transform.position.y,
      this.transform.position.z
    ];
  }
}

class Directional extends Model {
  constructor({color}) {
    super();
    this.color = color;
  }

  get direction() {
    return this.transform.forward.slice(0, 3);
  }
}

class Ambient {
  constructor({color, attenuation}) {
    this.color = color;
    this.attenuation = attenuation;
  }
}



var lts = Object.freeze({
	Point: Point,
	Directional: Directional,
	Ambient: Ambient
});

class Renderer {
  constructor({el, clearColor, extras}) {
    this.el = el;
    this.clearColor = clearColor;
    this.extras = extras;
    this._gl = null;
    this.canvas = null;
    this.setUpContext();
  }

  setUpContext() {
    this.canvas = document.getElementById(this.el);
    this._gl = this.canvas.getContext('webgl2', this.extras);
    let rect = this.canvas.getBoundingClientRect();

    this.canvas.width = rect.width;
    this.canvas.height = rect.height;

    this._gl.clearColor(this.clearColor[0], this.clearColor[1], this.clearColor[2], this.clearColor[3]);
    this._gl.viewport(0, 0, rect.width, rect.height);
    this._gl.enable(this._gl.DEPTH_TEST);
    this._gl.depthFunc(this._gl.LEQUAL);
    this._gl.frontFace(this._gl.CCW);
    this._gl.cullFace(this._gl.BACK);
    this._gl.polygonOffset(1.0, 0.1);
  }

  get gl() {
    if (this._gl === null) {
      this.setUpContext();
    }

    return this._gl;
  }

  clear() {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    return this;
  }

  cullFace(enable) {
    if (enable) {
      this.gl.enable(this.gl.CULL_FACE);
    } else {
      this.gl.disable(this.gl.CULL_FACE);
    }
    return this;
  }

  polygonOffset(enable) {
    if (enable) {
      this.gl.enable(this.gl.POLYGON_OFFSET_FILL);
    } else {
      this.gl.disable(this.gl.POLYGON_OFFSET_FILL);
    }
  }

  renderScene(scene, debug=false) {
    scene.getItemsByMaterial().forEach(info => {
      let shader = Shader.program(this.gl, info.type, debug);
      shader.activate(this.gl);
      this.setUpGlobalUniforms(shader, scene);
      info.items.forEach(i => {
        this.renderModel(shader, i);
      });
      shader.deactivate(this.gl);
    });
    return this;
  }

  renderItem(scene, item, debug=false) {
    let shader = Shader.program(this.gl, item.material.type, debug);
    shader.activate(this.gl);
    this.setUpGlobalUniforms(shader, scene);
    this.renderModel(shader, item);
    shader.deactivate(this.gl);
    return this;
  }

  setUpGlobalUniforms(shader, scene) {
    let gl = this.gl;
    let camera = scene.camera;
    let lights = scene.lights;
    let projMatrix = camera.getProjMatrix();
    let viewMatrix = camera.getViewMatrix();

    if (shader.locations.uniforms.u_view) {
      shader.setUView(gl, viewMatrix);
    }

    if (shader.locations.uniforms.u_proj) {
      shader.setUProj(gl, projMatrix);
    }

    if (shader.locations.uniforms.u_camera) {
      shader.setUCamera(gl, [camera.transform.position.x, camera.transform.position.y, camera.transform.position.z]);
    }

    if (shader.locations.uniforms.u_d_lights) {
      shader.setUDLights(gl, lights.directionals.map(d => {
        return {
          direction: d.direction,
          color: d.color
        };
      }));
    }

    if (shader.locations.uniforms.u_p_lights) {
      shader.setUPLights(gl, lights.point.map(p => {
        return {
          position: p.position,
          color: p.color,
          attenuation: p.attenuation
        };
      }));
    }

    if (shader.locations.uniforms.u_a_light && lights.ambient) {
      shader.setUALight(gl, lights.ambient);
    }

    return this;
  }

  renderModel(shader, model) {
    let gl = this.gl;
    let modelMatrix = model.getMatrix();
    let normalMatrix = model.getNormalMatrix();
    let geometry = model.geometry.renderInfo(gl);
    let material = model.material;
    let extras = model.extras;

    this.cullFace(extras.cull);
    this.polygonOffset(extras.polygonOffset);

    if (shader.locations.uniforms.u_model) {
      shader.setUModel(gl, modelMatrix);
    }

    if (shader.locations.uniforms.u_normal) {
      shader.setUNormal(gl, normalMatrix);
    }

    shader.bindMaterial(gl, material);

    this.renderGeometry(geometry);

    return shader;
  }

  renderGeometry({vao, mode, indexLength, vertexCount}) {
    this.gl.bindVertexArray(vao);
    if (indexLength) {
      this.gl.drawElements(mode, indexLength, this.gl.UNSIGNED_SHORT, 0);
    } else {
      this.gl.drawArrays(mode, 0, vertexCount);
    }
    this.gl.bindVertexArray(null);
  }

  delete() {
    this._gl = null;
    this.canvas = null;
  }
}

class Scene {
  constructor() {
    this.camera = null;
    this.items = {};
    this.lights = {
      directionals: [],
      point: [],
      ambient: null,
    };
  }

  setCamera(camera) {
    this.camera = camera;
    return this;
  }

  addDirectionalLight(light) {
    this.lights.directionals.push(light);
    return this;
  }

  addDirectionalLights(lights) {
    lights.forEach(l => this.addDirectionalLight(l));
    return this;
  }

  addPointLight(light) {
    this.lights.point.push(light);
    return this;
  }

  addPointLights(lights) {
    lights.forEach(l => this.addPointLight(l));
    return this;
  }

  addAmbientLight(light) {
    this.lights.ambient = light;
    return this;
  }

  addItem(item) {
    let type = item.material.type;

    if (!this.items[type]) {
      this.items[type] = [];
    }
    this.items[type].push(item);
    return this;
  }

  addItems(items) {
    items.forEach(i => this.addItem(i));
    return this;
  }

  getItemsByMaterial() {
    return Object.keys(this.items).map(k => {
      return {
        type: k,
        items: this.items[k]
      };
    });
  }

  delete() {
    this.getItemsByMaterial().forEach(({type, items}) => {
      items.forEach(item => item.delete());
      Shader.delete(type);
    });
    this.lights.directionals.forEach(d => d.delete());
    this.lights.point.forEach(p => p.delete());
  }
}

const cameras = cams;
const controls = ctrls;
const lights = lts;
const materials = mats;
const primitives = prims;
const shaders = shades;
const utils = utis;


var phanto = Object.freeze({
	cameras: cameras,
	controls: controls,
	lights: lights,
	materials: materials,
	primitives: primitives,
	shaders: shaders,
	utils: utils,
	Model: Model,
	Renderer: Renderer,
	Scene: Scene
});

let { Vao, Shader: Shader$1 } = shaders;
let { Renderer: Renderer$1, Scene: Scene$1, Model: Model$1, lights: lights$1, materials: materials$1, cameras: cameras$1, primitives: primitives$1 } = phanto;

class AudioWrapper {
  constructor() {
    this.audio = new Audio();
    this.fadeInID = null;
    this.fadeOutID = null;
    this.stopFadeIn = false;
    this.stopFadeOut = false;
  }

  setSource(src) {
    this.audio.src = src;
  }

  onLoaded(cb) {
    this.audio.oncanplay = cb.bind(this);
  }

  fadeIn() {
    cancelAnimationFrame(this.fadeOutID);
    let lastTime = null;
    let delta = null;
    this.play();

    this.audio.volume = 0;

    let fIN = function(time) {
      this.fadeInID = requestAnimationFrame(fIN);

      lastTime = lastTime || time;
      delta = time - lastTime;
      lastTime = time;
      this.audio.volume = Math.min(this.audio.volume + delta / 15000, 1);

      if (this.audio.volume >= 1 || this.stopFadeIn) {
        cancelAnimationFrame(this.fadeInID);
      }
    }.bind(this);

    this.fadeInID = requestAnimationFrame(fIN);
  }

  fadeOut() {
    cancelAnimationFrame(this.fadeInID);
    let lastTime = null;
    let delta = null;
    this.audio.volume = 1;

    let fOUT = function(time) {
      this.fadeOutID = requestAnimationFrame(fOUT);
      if(this.audio.paused || this.stopFadeOut) return cancelAnimationFrame(this.fadeOutID);

      lastTime = lastTime || time;
      delta = time - lastTime;
      lastTime = time;

      this.audio.volume = Math.max(this.audio.volume - delta / 3000, 0);

      if (this.audio.volume <= 0) {
        this.pause();
      }
    }.bind(this);

    this.fadeOutID = requestAnimationFrame(fOUT);
  }

  play() {
    this.audio.play();
  }

  pause() {
    this.audio.pause();
  }
}

const BASIC_FADE_SHADER = 'basic-fade';

const Resources$1 = (function() {
  let resources = [];
  let loaded = 0;
  let audios = {};

  return {
    add(items) {
      resources = resources.concat(items);
    },
    load() {
      resources.forEach((item) => {
        let audio = new AudioWrapper();
        audio.onLoaded(() => {
          loaded++;
        });

        audio.setSource(item.url);
        audios[item.name] = audio;
      });

      return new Promise(resolve => {
        let stopId = null;

        function check() {
          stopId = requestAnimationFrame(check);

          if (loaded >= resources.length) {
            cancelAnimationFrame(stopId);
            resolve(audios);
          }
        }

        stopId = requestAnimationFrame(check);
      });
    },
    audios
  }
})();

Shader$1
  .create(BASIC_FADE_SHADER)
  .defaults()
  .vertex()
    .addOutput({name: 'position', type: 'vec3'})
    .addFunction(`
      void main(void) {
        vec4 world_coord = u_model * vec4(a_position, 1.0);
        gl_Position = u_proj * u_view * world_coord;
        position = gl_Position.xyz;
      }
    `)
  .fragment()
    .addInput({name: 'position', type: 'vec3'})
    .addUniform({name: 'u_color', type: 'vec3'})
    .addFunction(`
      float map(float value, float low1, float high1, float low2, float high2) {
        return low2 + (value - low1) * (high2 - low2) / (high1 - low1);
      }
    `)
    .addFunction(`
      void main(void) {
        float z = -position.z;
        float fog = map(z, -25.0, 0.0, 0.0, 1.0);
        final_color = vec4(u_color, 1.0) * vec4(fog, fog, fog, 1.0);
      }
    `)
  .materialHandler((shader, gl, material) => {
    shader.setUColor(gl, material.color);
  });


function basicFade(color) {
  return {
    type: BASIC_FADE_SHADER,
    color
  };
}

function circle$1(r=1, d=48) {
  let vertices = [];
  let s = 2 * Math.PI / d;

  for (let i = 0; i < d; i++) {
    vertices.push(r * Math.cos(s * i));
    vertices.push(r * Math.sin(s * i));
    vertices.push(0.0);
  }

  return Vao
    .create()
    .setMode('LINE_LOOP')
    .addAttrib({
      data: vertices,
      componentLen: 3,
      location: 0
    });
}
function quad$1(d=48, full=false) {
  let vertices = [];
  let indexes = [];
  let s = 2 * Math.PI / d;
  let l = Math.floor(d / 12);
  let r = full ? 0 : 0.7;



  for (let p = 0; p <= l; p++) {
    vertices.push(Math.cos(s * p));
    vertices.push(Math.sin(s * p));
    vertices.push(0.0);
  }

  for (let p = 0; p <= l; p++) {
    vertices.push(r * Math.cos(s * p));
    vertices.push(r * Math.sin(s * p));
    vertices.push(0.0);
  }

  for (let p = 0; p < l; p++) {
    indexes.push(0 + p);
    indexes.push((l + 2) + p);
    indexes.push((l + 1) + p);
    indexes.push(0 + p);
    indexes.push(1 + p);
    indexes.push((l + 2) + p);
  }

  return Vao
    .create()
    .setMode('TRIANGLES')
    .addAttrib({
      data: vertices,
      componentLen: 3,
      location: 0
    }).setIndexes(indexes);
}


let renderer = new Renderer$1({el: 'canvas', clearColor: [0.0, 0.0, 0.0]});
let canvas = renderer.canvas;
let camera = new cameras$1.Perspective(Math.PI / 3, canvas.width / canvas.height, 0.01, 1000);
let scene = new Scene$1();
let geo = circle$1();
let mat = basicFade([1.0, 1.0, 1.0]);

let models = Array(30).fill(0).map((_, i) => {
  return new Model$1(geo, mat).setTranslate(0, 0, -i).update();
});

let qgeo = quad$1();
let qmats = [
  basicFade([1.0, 1.0, 1.0]),
  basicFade([1, 0.3, 0.5]),
  // basicFade([1, 1, 0.4]),
  basicFade([0.4, 1, 1]),
  // basicFade([1, 0.5, 0]),

];
let qmodels = Array(models.length / 2).fill(0).map(() => {
  let q = new Model$1(qgeo, qmats[Math.floor(Math.random() * qmats.length)]);
  let side = Math.floor(Math.random() * 12);
  let z = Math.floor(Math.random() * models.length);
  q.baseRotation = 180 / 6 * side;
  q.baseMaterial = q.material;
  q.setRotate(0, 0, q.baseRotation);
  q.setTranslate(Math.cos(q.baseRotation), Math.sin(q.baseRotation), -z).update();
  return q;
});

scene.setCamera(camera).addItems(models).addItems(qmodels);

let camAngle = 0;
let initialSpeed = 200;
let maxSpeed = 70;
let acceleration = 10;
let speed = 250;
let a = 10;
let over = false;

function handleCollsions(time) {
  let all = qmodels.concat(fullModels.reduce((a, b) => a.concat(b), []));
  all.forEach(m => {
    m.material = m.baseMaterial;
    if (m.transform.position.z > -0.25 && m.transform.position.z < 0) {
      let mangle = m.transform.rotate.z;

      mangle = mangle + 360 * 1000;
      mangle = mangle % 360;

      if (270 - (180 / 6) < mangle && mangle < 270) {
        Resources$1.audios['impact'].play();
        over = true;
        acceleration = 0;
      }
    }
  });
}

let speedTimer = 0;
let lastTime = 0;
let score = 0;
let addItem = true;

let fgeo = quad$1(36, true);

let fullModels = [];

let loop = utils.createLoop((delta, time) => {
  models.sort((a, b) => a.transform.position.z - b.transform.position.z);
  let lz = models[0].transform.position.z;

  if (over) {
    Resources$1.audios['soundtrack'].pause();
    acceleration -= delta / 2;
  } else if (speedTimer > 10) {
    acceleration = -10;
    speedTimer = 0;
  }

  if (!over) {
    score = Math.floor(time - lastTime / 100);
  }

  if (!over && score > 33000 && addItem) {
    let f = new Model$1(fgeo, basicFade([0, 1, 0]));
    let f2 = new Model$1(fgeo, basicFade([0, 1, 0]));
    let fs = 180 / 6 * Math.floor(Math.random() * 12);

    addItem = false;

    f.baseRotation = fs;
    f.baseMaterial = f.material;
    f2.baseRotation = fs + 180;
    f2.baseMaterial = f2.material;

    f.setRotate(0, 0, fs).setTranslate(0, 0, lz).update();
    f2.setRotate(0, 0, fs + 180).setTranslate(0, 0, lz).update();

    fullModels.push([f, f2]);

    scene.addItem(f);
    scene.addItem(f2);
  }

  speed -= acceleration * delta / 1000;
  speed = Math.max(maxSpeed, speed);

  if (!over) {
    if (utils.keyboard.RIGHT) {
      a -= delta / 2.5;
    } else if (utils.keyboard.LEFT) {
      a += delta / 2.5;
    }
  }

  if (speed < maxSpeed + 50) {
    let diff = speed - maxSpeed;
    let o = diff / 50;
    mat.color = [1.0, o, o];
  }

  if (speed == maxSpeed) {
    speedTimer += delta / 1000;
  }

  if (speed > initialSpeed - 100 && !over && acceleration < 0) {
    acceleration = 30;
  }

  camAngle += Math.PI / 40 * delta / speed;
  let x = Math.cos(camAngle);
  let y = Math.sin(camAngle);
  camera.setTranslate(x, y - 0.8, 0.0).update();

  qmodels.forEach((m, i) => {
    let z = m.transform.position.z;
    if (i % 2) {
      m.baseRotation += delta / 10;
    }

    z += delta / speed;
    if (z > 1) {
      z = lz - 1;
      m.baseRotation = 180 / 6 * Math.floor((Math.random() * 12));
    }

    let angle = camAngle + Math.PI / 40 * z;
    let x = Math.cos(angle);
    let y = Math.sin(angle);

    m.setRotate(0, 0, m.baseRotation + a);
    m.setTranslate(x, y, z).update();
  });

  fullModels.forEach((m) => {
    let m0 = m[0];
    let m1 = m[1];

    let z = m0.transform.position.z;
    z += delta / speed;
    if (z > 1) {
      z = lz - 1;
      m0.baseRotation = 180 / 6 * Math.floor((Math.random() * 12));
      m1.baseRotation = m0.baseRotation + 180;
    }

    let angle = camAngle + Math.PI / 40 * z;
    let x = Math.cos(angle);
    let y = Math.sin(angle);

    m0.setRotate(0, 0, m0.baseRotation + a);
    m0.setTranslate(x, y, z).update();

    m1.setRotate(0, 0, m1.baseRotation + a);
    m1.setTranslate(x, y, z).update();
  });

  models.forEach((m, i) => {
    let z = m.transform.position.z;
    z += delta / speed;
    if (z > 1) { z = lz - 1; }

    let angle = camAngle + Math.PI / 40 * (z);
    let x = Math.cos(angle);
    let y = Math.sin(angle);

    m.setRotate(0, 0, a);
    m.setTranslate(x, y, z).update();
  });

  if (!over) {
    handleCollsions(time);
  }

  renderer.clear().renderScene(scene, true);
});

Resources$1.add([
  {
    name: 'soundtrack',
    url: 'static/soundtrack.mp3'
  },
  {
    name: 'impact',
    url: 'static/impact.mp3'
  }
]);

Resources$1.load().then(() => {
  Resources$1.audios['soundtrack'].fadeIn();
  loop.start();
});

})));
