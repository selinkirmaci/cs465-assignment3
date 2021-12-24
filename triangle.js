var points = [];
var outerSurfacePoints = [];
var colors = [];

var lines = false;

var canvas;
var gl;
var program;

var normalsArray = [];

var near = -10;
var far = 10;
var radius = 1.5;
var theta  = 0.0;
var phi    = 0.0;
var dr = 5.0 * Math.PI/180.0;

var left = -12.0;
var right = 12.0;
var ytop =12.0;
var bottom = -12.0;
    
var lightPosition = vec4(1.0, 1.0, 1.0, 0.0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialShininess = 20.0;

var ctm;
var ambientColor, diffuseColor, specularColor;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

var normalMatrix, normalMatrixLoc;

var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);
    
function triangle(a, b, c) {

    var t1 = subtract(b, a);
    var t2 = subtract(c, a);
    var normal = normalize(cross(t2, t1));
    normal = vec4(normal);

    
    normalsArray.push(normal);
    normalsArray.push(normal);
    normalsArray.push(normal);
    

    outerSurfacePoints.push(a);
    outerSurfacePoints.push(b);      
    outerSurfacePoints.push(c);
}

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    document.getElementById("Button6").onclick = function(){
        program = initShaders( gl, "gouraud-vertex-shader", "gouraud-fragment-shader" );
        gl.useProgram( program );
        ambientProduct = mult(lightAmbient, materialAmbient);
        diffuseProduct = mult(lightDiffuse, materialDiffuse);
        specularProduct = mult(lightSpecular, materialSpecular);

        createTorus(2,5,10,5,0.6,0.75,0.35);
        adjustPoints(180,11);

        var nBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
        gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );
        
        var vNormal = gl.getAttribLocation( program, "vNormal" );
        gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray( vNormal);

        var vBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(outerSurfacePoints), gl.STATIC_DRAW);
        
        var vPosition = gl.getAttribLocation( program, "vPosition");
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);
        
        modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
        projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
        normalMatrixLoc = gl.getUniformLocation( program, "normalMatrix" );

        document.getElementById("Button0").onclick = function(){radius *= 2.0;};
        document.getElementById("Button1").onclick = function(){radius *= 0.5;};
        document.getElementById("Button2").onclick = function(){theta += dr;};
        document.getElementById("Button3").onclick = function(){theta -= dr;};
        document.getElementById("Button4").onclick = function(){phi += dr;};
        document.getElementById("Button5").onclick = function(){phi -= dr;};


        gl.uniform4fv( gl.getUniformLocation(program, 
        "ambientProduct"),flatten(ambientProduct) );
        gl.uniform4fv( gl.getUniformLocation(program, 
        "diffuseProduct"),flatten(diffuseProduct) );
        gl.uniform4fv( gl.getUniformLocation(program, 
        "specularProduct"),flatten(specularProduct) );	
        gl.uniform4fv( gl.getUniformLocation(program, 
        "lightPosition"),flatten(lightPosition) );
        gl.uniform1f( gl.getUniformLocation(program, 
        "shininess"),materialShininess );
        render();
    
    }
    document.getElementById("Button7").onclick = function(){
        program = initShaders( gl, "phong-vertex-shader", "phong-fragment-shader" );
        gl.useProgram( program );
        ambientProduct = mult(lightAmbient, materialAmbient);
        diffuseProduct = mult(lightDiffuse, materialDiffuse);
        specularProduct = mult(lightSpecular, materialSpecular);

        createTorus(2,5,10,5,0.6,0.75,0.35);
        adjustPoints(180,11);

        var nBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
        gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );
        
        var vNormal = gl.getAttribLocation( program, "vNormal" );
        gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray( vNormal);

        var vBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(outerSurfacePoints), gl.STATIC_DRAW);
        
        var vPosition = gl.getAttribLocation( program, "vPosition");
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);
        
        modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
        projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
        normalMatrixLoc = gl.getUniformLocation( program, "normalMatrix" );

        document.getElementById("Button0").onclick = function(){radius *= 2.0;};
        document.getElementById("Button1").onclick = function(){radius *= 0.5;};
        document.getElementById("Button2").onclick = function(){theta += dr;};
        document.getElementById("Button3").onclick = function(){theta -= dr;};
        document.getElementById("Button4").onclick = function(){phi += dr;};
        document.getElementById("Button5").onclick = function(){phi -= dr;};


        gl.uniform4fv( gl.getUniformLocation(program, 
        "ambientProduct"),flatten(ambientProduct) );
        gl.uniform4fv( gl.getUniformLocation(program, 
        "diffuseProduct"),flatten(diffuseProduct) );
        gl.uniform4fv( gl.getUniformLocation(program, 
        "specularProduct"),flatten(specularProduct) );	
        gl.uniform4fv( gl.getUniformLocation(program, 
        "lightPosition"),flatten(lightPosition) );
        gl.uniform1f( gl.getUniformLocation(program, 
        "shininess"),materialShininess );
        render();
    }  

    
}

/*function adjustPoints(number_of_points_on_knot_curve, number_of_points_on_each_circle){
    for(i = 0; i < number_of_points_on_knot_curve - 1; i++){
        for(j = 0; j < number_of_points_on_each_circle - 1; j++){
            outerSurfacePoints.push(points[i*number_of_points_on_each_circle + j]);
            outerSurfacePoints.push(points[i*number_of_points_on_each_circle + j+1]);
            outerSurfacePoints.push(points[i*number_of_points_on_each_circle + j+number_of_points_on_each_circle]);

            outerSurfacePoints.push(points[i*number_of_points_on_each_circle + j+1]);
            outerSurfacePoints.push(points[i*number_of_points_on_each_circle + j+number_of_points_on_each_circle]);
            outerSurfacePoints.push(points[i*number_of_points_on_each_circle + j+number_of_points_on_each_circle + 1]);
        }
        outerSurfacePoints.push(points[i*number_of_points_on_each_circle + j]); // j = 10 yani çemberdeki 11. nokta  yani indexi 10
        outerSurfacePoints.push(points[i*number_of_points_on_each_circle + j - number_of_points_on_each_circle + 1]); // index 0
        outerSurfacePoints.push(points[i*number_of_points_on_each_circle + j + number_of_points_on_each_circle]);

        outerSurfacePoints.push(points[i*number_of_points_on_each_circle + j - number_of_points_on_each_circle + 1]);
        outerSurfacePoints.push(points[i*number_of_points_on_each_circle + j + 1]);
        outerSurfacePoints.push(points[i*number_of_points_on_each_circle + j+number_of_points_on_each_circle]);
    }
    // son halkayı baştakine bağlama
    for(i = 0; i < 10; i++){
        outerSurfacePoints.push(points[(number_of_points_on_knot_curve - 1) * number_of_points_on_each_circle + i]);
        outerSurfacePoints.push(points[(number_of_points_on_knot_curve - 1) * number_of_points_on_each_circle + i + 1]);
        outerSurfacePoints.push(points[i]);

        outerSurfacePoints.push(points[(number_of_points_on_knot_curve - 1) * number_of_points_on_each_circle + i + 1]);
        outerSurfacePoints.push(points[i]);
        outerSurfacePoints.push(points[i + 1]);
    }
    outerSurfacePoints.push(points[(number_of_points_on_knot_curve - 1) * number_of_points_on_each_circle + number_of_points_on_each_circle - 1])
    outerSurfacePoints.push(points[(number_of_points_on_knot_curve - 1) * number_of_points_on_each_circle])
    outerSurfacePoints.push(points[number_of_points_on_each_circle - 1])

    outerSurfacePoints.push(points[(number_of_points_on_knot_curve - 1) * number_of_points_on_each_circle])
    outerSurfacePoints.push(points[0])
    outerSurfacePoints.push(points[number_of_points_on_each_circle - 1])
}*/
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

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    eye = vec3(radius*Math.sin(theta)*Math.cos(phi), 
        radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta));

    modelViewMatrix = lookAt(eye, at , up);
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);
    
    // normal matrix only really need if there is nonuniform scaling
    // it's here for generality but since there is
    // no scaling in this example we could just use modelView matrix in shaders
    
    normalMatrix = [
        vec3(modelViewMatrix[0][0], modelViewMatrix[0][1], modelViewMatrix[0][2]),
        vec3(modelViewMatrix[1][0], modelViewMatrix[1][1], modelViewMatrix[1][2]),
        vec3(modelViewMatrix[2][0], modelViewMatrix[2][1], modelViewMatrix[2][2])
    ];
            
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
    gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix) );
        
    if(lines){
        gl.drawArrays( gl.LINE_STRIP, 0, outerSurfacePoints.length );
    }
    else{

        gl.drawArrays( gl.TRIANGLE_STRIP, 0, outerSurfacePoints.length );
        
    }

    window.requestAnimFrame(render);
}


