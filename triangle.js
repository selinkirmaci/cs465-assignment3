var canvas;
var gl;

var points = [];
var outerSurfacePoints = [];

var program;

var colorsArray = [];
var texCoordsArray = [];

var projectionMatrix = [];

var texture;

function triangle(a, b, c) {
/*
    var t1 = subtract(b, a);
    var t2 = subtract(c, a);
    var normal = normalize(cross(t2, t1));
    normal = vec4(normal);

    
    normalsArray.push(normal);
    normalsArray.push(normal);
    normalsArray.push(normal);
    */

    outerSurfacePoints.push(a);
    colorsArray.push(vec4(1,0,0,1));
    colorsArray.push(vec4(1,0,0,1));
    colorsArray.push(vec4(1,0,0,1));
    outerSurfacePoints.push(b);      
    outerSurfacePoints.push(c);
}

function adjustPoints(number_of_points_on_knot_curve, number_of_points_on_each_circle){
    for(i = 0; i < number_of_points_on_knot_curve - 1; i++){
        for(j = 0; j < number_of_points_on_each_circle - 1; j++){
            triangle(points[i*number_of_points_on_each_circle + j],
                    points[i*number_of_points_on_each_circle + j+number_of_points_on_each_circle],
                    points[i*number_of_points_on_each_circle + j+1]);// sağ el kuralı
                    texCoordsArray.push(vec2(i/180,j/11));
                    texCoordsArray.push(vec2(i/180,j/11));
                    texCoordsArray.push(vec2(i/180,j/11));
            triangle(points[i*number_of_points_on_each_circle + j+number_of_points_on_each_circle],
                    points[i*number_of_points_on_each_circle + j+number_of_points_on_each_circle + 1],
                    points[i*number_of_points_on_each_circle + j+1] );// sağ el kuralı
                    texCoordsArray.push(vec2(i/180,j/11));
                    texCoordsArray.push(vec2(i/180,j/11));
                    texCoordsArray.push(vec2(i/180,j/11));
        }
        triangle(points[i*number_of_points_on_each_circle + j],
                points[i*number_of_points_on_each_circle + j + number_of_points_on_each_circle],
                points[i*number_of_points_on_each_circle + j - number_of_points_on_each_circle + 1]); // sağ el kuralı
                texCoordsArray.push(vec2(i/180,1));
                texCoordsArray.push(vec2(i/180,1));
                texCoordsArray.push(vec2(i/180,1));
        triangle(points[i*number_of_points_on_each_circle + j - number_of_points_on_each_circle + 1],
                points[i*number_of_points_on_each_circle + j+number_of_points_on_each_circle],
                points[i*number_of_points_on_each_circle + j + 1]);// sağ el kuralı
                texCoordsArray.push(vec2(i/180,1));
                texCoordsArray.push(vec2(i/180,1));
                texCoordsArray.push(vec2(i/180,1));

    }    
    for(i = 0; i < number_of_points_on_each_circle - 1; i++){
        triangle(points[i],
                points[(number_of_points_on_knot_curve - 1) * number_of_points_on_each_circle + i + 1],
                points[(number_of_points_on_knot_curve - 1) * number_of_points_on_each_circle + i]);// sağ el kuralı
                texCoordsArray.push(vec2(1,i/11));
                texCoordsArray.push(vec2(1,i/11));
                texCoordsArray.push(vec2(1,i/11));
        triangle(points[(number_of_points_on_knot_curve - 1) * number_of_points_on_each_circle + i + 1],
                points[i],
                points[i + 1]);// sağ el kuralı
                texCoordsArray.push(vec2(1,i/11));
                texCoordsArray.push(vec2(1,i/11));
                texCoordsArray.push(vec2(1,i/11));
    }
    triangle(points[number_of_points_on_each_circle - 1],
            points[(number_of_points_on_knot_curve - 1) * number_of_points_on_each_circle],
            points[(number_of_points_on_knot_curve - 1) * number_of_points_on_each_circle + number_of_points_on_each_circle - 1]);
            texCoordsArray.push(vec2(1,1));
            texCoordsArray.push(vec2(1,1));
            texCoordsArray.push(vec2(1,1));
    triangle(points[(number_of_points_on_knot_curve - 1) * number_of_points_on_each_circle],
            points[number_of_points_on_each_circle - 1],
            points[0]);// sağ el kuralı
            texCoordsArray.push(vec2(1,1));
            texCoordsArray.push(vec2(1,1));
            texCoordsArray.push(vec2(1,1));

}

function createTorus(p, q1, q2, m1,r1,r2,s1) 
{
    var u, v, x, y, z, xx, yy, zz, temp = vec4();
    for(i = 0; i < 360; i+=2)
    {
        u =  i * (Math.PI/180);
        
        x = Math.cos(p*u)*(1 + r1*(Math.cos(q1 * u) + r2 * Math.cos(q2 * u)));
        y = Math.sin(p*u)*(1 + r1*(Math.cos(q1 * u) + r2 * Math.cos(q2 * u)));
        z = s1*Math.sin(m1*u);
        
        
        for(j = 0; j <= 360; j+=36)
        {
            v =  j * (Math.PI/180);
            
            xx = (4 * x + Math.cos(v) * x);
            yy = (4 * y + Math.cos(v) * y);
            zz = Math.sin(v) + z;


            temp = vec4(xx,yy,zz,1.0);
            points.push(temp);
        }
    }
    
}

var texSize = 2048;

// Create a checkerboard pattern using floats


var image1 = new Array()
    for (var i =0; i<texSize; i++)  image1[i] = new Array();
    for (var i =0; i<texSize; i++) 
        for ( var j = 0; j < texSize; j++) 
           image1[i][j] = new Float32Array(4);
    for (var i =0; i<texSize; i++) for (var j=0; j<texSize; j++) {
        var c = (((i & 0x8) == 0) ^ ((j & 0x8)  == 0));
        image1[i][j] = [c, c, c, 1];
    }
var image2 = new Uint8Array(4*texSize*texSize);

    for ( var i = 0; i < texSize; i++ ) 
        for ( var j = 0; j < texSize; j++ ) 
           for(var k =0; k<4; k++) 
                image2[4*texSize*i+4*j+k] = 255*image1[i][j][k];
        


var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = xAxis;

var theta = [0,0,0];

var thetaLoc;

function configureTexture(image) {
    texture = gl.createTexture();
    gl.activeTexture( gl.TEXTURE0 );
    gl.bindTexture( gl.TEXTURE_2D, texture );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, 
        gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, 
        gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
}


window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    createTorus(2,5,10,5,0.6, 0.75, 0.35)
    adjustPoints(180,11);
    console.log(outerSurfacePoints.length);
    console.log(texCoordsArray.length);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW );
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(outerSurfacePoints), gl.STATIC_DRAW);
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    var tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW );
    var vTexCoord = gl.getAttribLocation( program, "vTexCoord");
    gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTexCoord);

    configureTexture(image2);

    thetaLoc = gl.getUniformLocation(program, "theta"); 
    
    document.getElementById("ButtonX").onclick = function(){axis = xAxis;};
    document.getElementById("ButtonY").onclick = function(){axis = yAxis;};
    document.getElementById("ButtonZ").onclick = function(){axis = zAxis;};

    projectionMatrix = ortho(-15,15,-15,15,-15,15);
    var projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
                              
    render();
}

var render = function() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    theta[axis] += 2.0;
    gl.uniform3fv(thetaLoc, theta);
    gl.drawArrays( gl.TRIANGLES, 0, outerSurfacePoints.length );
    requestAnimFrame(render);
}
