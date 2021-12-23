var canvas;
var gl;

var NumVertices  = 36;

var points = [];
var outerSurfacePoints = [];
var normalsArray = [];
var colors = [];

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 0;


var flag = true;


let camSpeed = 2;

let modelViewMatrix;
let projectionMatrix;
let projectionMatrixLoc;
let modelViewMatrixLoc;

let camRotX1 = 0;
let camRotY1 = 0;
let camRotZ1 = 0;

let buttonMode = 0;

var eye = vec3(1.0,1.0,1.0);
var at = vec3(0.0, 0.0, 1.0);
var up = vec3(0.0, 1.0, 0.0);

let a = 15;


//lighting variables

var va = vec4(0.0, 0.0, -1.0,1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333,1);
    
var lightPosition = vec4(0.0, 0.0, 1.0, 0.0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialShininess = 20.0;

var ambientColor, diffuseColor, specularColor;

var normalMatrix, normalMatrixLoc;


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


window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    createTorus(2,5,10,5);
    console.log("points.length = " + points.length);
    adjustPoints(180,11);
    

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );
    
    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(outerSurfacePoints), gl.STATIC_DRAW );
    

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    normalMatrixLoc = gl.getUniformLocation( program, "normalMatrix" );

    
    projectionMatrix = ortho(-15, 15, -15, 15, -100, 100);
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );

    modelViewMatrix = lookAt(eye, at , up);


    
    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);


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
    
    //event listeners for buttons
    
    document.getElementById( "wireframeButton" ).onclick = function () {
        console.log("wireframe");
        buttonMode = 0;
        render();

    };
    document.getElementById( "gouraudButton" ).onclick = function () {
        console.log("gouraudButton");
        buttonMode = 1;
        render();

    };
    document.getElementById( "phongButton" ).onclick = function () {
        console.log("phongButton");
        buttonMode = 2;
        render();
    };

    


    //zoom in and out
    canvas.addEventListener("wheel", function (event) {
        if (event.deltaY > 0) a++;
            else a--;

        projectionMatrix = ortho(-a, a, -a, a, -100, 100);
        /*
        modelViewMatrix = mult(modelViewMatrix, rotate(camRotX1, 1, 0, 0));
        modelViewMatrix = mult(modelViewMatrix, rotate(camRotY1, 0, 1, 0));
        modelViewMatrix = mult(modelViewMatrix, rotate(camRotZ1, 0, 0, 1));
        */
        gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );

        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    });

    //CAmera movement around x y z
    document.addEventListener('keydown', function (event) {
        let camRotX = 0;
        let camRotY = 0;
        let camRotZ = 0;
        if (event.key === 'w') {
            camRotX -=camSpeed;
            camRotX1 -=camSpeed;
            modelViewMatrix = mult(modelViewMatrix, rotate(camRotX, 1, 0, 0));
            gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );

        }else if(event.key === 's')
        {
            camRotX += camSpeed;
            camRotX1 +=camSpeed;
            modelViewMatrix = mult(modelViewMatrix, rotate(camRotX, 1, 0, 0));
            gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );

        }else if(event.key === 'd')
        {
            camRotY -= camSpeed;
            camRotY1 -= camSpeed;
            modelViewMatrix = mult(modelViewMatrix, rotate(camRotY, 0, 1, 0));
            gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
        }else if(event.key === 'a')
        {
            camRotY += camSpeed;
            camRotY1 += camSpeed;

            modelViewMatrix = mult(modelViewMatrix, rotate(camRotY, 0, 1, 0));
            gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
        }else if(event.key === 'z')
        {
            camRotZ += camSpeed;
            camRotZ1 += camSpeed;

            modelViewMatrix = mult(modelViewMatrix, rotate(camRotZ, 0, 0, 1));
            gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
        }else if(event.key === 'x')
        {
            camRotZ -= camSpeed;
            camRotZ1 -= camSpeed;

            modelViewMatrix = mult(modelViewMatrix, rotate(camRotZ, 0, 0, 1));
            gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
        }                               
    });


        
    render();
}

function adjustPoints(number_of_points_on_knot_curve, number_of_points_on_each_circle){
    
    triangle(points[(number_of_points_on_knot_curve - 1) * number_of_points_on_each_circle + number_of_points_on_each_circle - 1],points[number_of_points_on_each_circle - 1],points[(number_of_points_on_knot_curve - 1) * number_of_points_on_each_circle]);

    triangle(points[(number_of_points_on_knot_curve - 1) * number_of_points_on_each_circle] , points[0] , points[number_of_points_on_each_circle - 1]);
    


    for(i = 0; i < 10; i++){
        triangle(points[(number_of_points_on_knot_curve - 1) * number_of_points_on_each_circle + i + 1],points[i],points[i + 1]);
        triangle(points[(number_of_points_on_knot_curve - 1) * number_of_points_on_each_circle + i],points[(number_of_points_on_knot_curve - 1) * number_of_points_on_each_circle + i + 1],points[i]);
    }
    for(i = 0; i < number_of_points_on_knot_curve - 1; i++){
        for(j = 0; j < number_of_points_on_each_circle - 1; j++){


            triangle(points[i*number_of_points_on_each_circle + j+1],points[i*number_of_points_on_each_circle + j+number_of_points_on_each_circle],points[i*number_of_points_on_each_circle + j+number_of_points_on_each_circle + 1]);
            triangle(points[i*number_of_points_on_each_circle + j],points[i*number_of_points_on_each_circle + j+1],points[i*number_of_points_on_each_circle + j+number_of_points_on_each_circle]);

        }
        triangle(points[i*number_of_points_on_each_circle + j - number_of_points_on_each_circle + 1],points[i*number_of_points_on_each_circle + j + 1],points[i*number_of_points_on_each_circle + j+number_of_points_on_each_circle]);

        triangle(points[i*number_of_points_on_each_circle + j],points[i*number_of_points_on_each_circle + j - number_of_points_on_each_circle + 1],points[i*number_of_points_on_each_circle + j + number_of_points_on_each_circle]);
    }
    // son halkayı baştakine bağlama
   
 
    
}

function createTorus(p, q1, q2, q) 
{
    var u, v, x, y, z, xx, yy, zz, temp = vec4();
    for(i = 0; i < 360; i+=2)
    {
        u =  i * (Math.PI/180);
        
        x = Math.cos(p*u)*(1 + 0.6*(Math.cos(q1 * u) + 0.75 * Math.cos(q2 * u)));
        y = Math.sin(p*u)*(1 + 0.6*(Math.cos(q1 * u) + 0.75 * Math.cos(q2 * u)));
        z = 0.35*Math.sin(q*u);
        
        
        for(j = 0; j <= 360; j+=36)
        {
            v =  j * (Math.PI/180);
            
            xx = (10 * x + Math.cos(v) * x);
            yy = (10 * y + Math.cos(v) * y);
            zz = Math.sin(v) + z;


            temp = vec4(xx,yy,zz,1.0);
            points.push(temp);
        }
    }
    
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    //modelViewMatrix = lookAt(eye, at , up);
    
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );

    //projectionMatrix = ortho(-a, a, -a, a, -100, 100);


    normalMatrix = [
        vec3(modelViewMatrix[0][0], modelViewMatrix[0][1], modelViewMatrix[0][2]),
        vec3(modelViewMatrix[1][0], modelViewMatrix[1][1], modelViewMatrix[1][2]),
        vec3(modelViewMatrix[2][0], modelViewMatrix[2][1], modelViewMatrix[2][2])
    ];

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
    gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix) );

    if(buttonMode === 0)
        gl.drawArrays( gl.LINE_LOOP, 0, outerSurfacePoints.length );
    else if(buttonMode === 1)
        gl.drawArrays( gl.TRIANGLE_STRIP, 0, outerSurfacePoints.length );


    window.requestAnimFrame( render );
}


