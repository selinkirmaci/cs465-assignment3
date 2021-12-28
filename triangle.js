var canvas;
var gl;

var points = [];
var outerSurfacePoints = [];

var texSize = 64;

var program;

var pointsArray = [];
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
    outerSurfacePoints.push(b);      
    outerSurfacePoints.push(c);
}

function adjustPoints(number_of_points_on_knot_curve, number_of_points_on_each_circle){
    for(i = 0; i < number_of_points_on_knot_curve - 1; i++){
        for(j = 0; j < number_of_points_on_each_circle - 1; j++){

            triangle(points[i*number_of_points_on_each_circle + j] , points[i*number_of_points_on_each_circle + j+number_of_points_on_each_circle], points[i*number_of_points_on_each_circle + j+1]);
            triangle(points[i*number_of_points_on_each_circle + j+number_of_points_on_each_circle], points[i*number_of_points_on_each_circle + j+number_of_points_on_each_circle + 1], points[i*number_of_points_on_each_circle + j+1] );
             
        }
        triangle(points[i*number_of_points_on_each_circle + j],points[i*number_of_points_on_each_circle + j + number_of_points_on_each_circle],points[i*number_of_points_on_each_circle + j - number_of_points_on_each_circle + 1]);

        triangle(points[i*number_of_points_on_each_circle + j - number_of_points_on_each_circle + 1],points[i*number_of_points_on_each_circle + j+number_of_points_on_each_circle],points[i*number_of_points_on_each_circle + j + 1]);

    }    
    for(i = 0; i < number_of_points_on_each_circle - 1; i++){
        triangle(points[i], points[(number_of_points_on_knot_curve - 1) * number_of_points_on_each_circle + i + 1], points[(number_of_points_on_knot_curve - 1) * number_of_points_on_each_circle + i]);
        triangle(points[(number_of_points_on_knot_curve - 1) * number_of_points_on_each_circle + i + 1], points[i], points[i + 1]);
    }
    triangle(points[number_of_points_on_each_circle - 1],points[(number_of_points_on_knot_curve - 1) * number_of_points_on_each_circle + number_of_points_on_each_circle - 1],points[(number_of_points_on_knot_curve - 1) * number_of_points_on_each_circle]);
    triangle(points[(number_of_points_on_knot_curve - 1) * number_of_points_on_each_circle]  , points[number_of_points_on_each_circle - 1], points[0]);

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

function adjustTextureCoor(number_of_points_on_knot_curve, number_of_points_on_each_circle){
    for( i = 0; i <= 1; i += 1/number_of_points_on_knot_curve){
        for(j = 0; j <= 1; j += 1/number_of_points_on_each_circle){
            texCoordsArray.push(vec2(i,j));
        }
    }
}
var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = xAxis;
var theta = [45.0, 45.0, 45.0];

var thetaLoc;

function configureTexture( image ) {
    texture = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, 
         gl.RGB, gl.UNSIGNED_BYTE, image );
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, 
                      gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
    
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
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
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    createTorus(2,5,10,5,0.6, 0.75, 0.35)
    adjustPoints(180,11);
    adjustTextureCoor(180,11);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(outerSurfacePoints), gl.STATIC_DRAW );
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    
    var tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW );
    
    var vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
    gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vTexCoord );

    //
    // Initialize a texture
    //

    //var image = new Image();
    //image.onload = function() { 
     //   configureTexture( image );
    //}
    //image.src = "SA2011_black.gif"


    var image = document.getElementById("texImage");
 
    configureTexture( image );

    thetaLoc = gl.getUniformLocation(program, "theta"); 
    
    document.getElementById("ButtonX").onclick = function(){axis = xAxis;};
    document.getElementById("ButtonY").onclick = function(){axis = yAxis;};
    document.getElementById("ButtonZ").onclick = function(){axis = zAxis;};
       
    render();

    projectionMatrix = ortho(-15,15,-15,15,-15,15);
    var projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
 
}

var render = function(){
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    theta[axis] += 2.0;
    gl.uniform3fv(thetaLoc, flatten(theta));
    gl.drawArrays( gl.TRIANGLES, 0, outerSurfacePoints.length );
    requestAnimFrame(render);
}
