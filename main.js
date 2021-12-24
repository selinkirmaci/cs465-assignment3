var canvas;
var gl;
var program;

var vBuffer,nBuffer;

var NumVertices  = 36;

var points = [];
var outerSurfacePoints = [];
var normalsArray = [];
var pathArray = [];
var colors = [];

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 0;

var radius = 4;


var flag = true;


let camSpeed = 2;

var pAngle = 2;
var q1Angle = 5;
var q2Angle = 10;
var qAngle = 5;

let modelViewMatrix;
let projectionMatrix;
let projectionMatrixLoc;
let modelViewMatrixLoc;

let camRotX1 = 0;
let camRotY1 = 0;
let camRotZ1 = 0;

let buttonMode = 0;

var eye = vec3(1.0,1.0,1.0);
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

let a = 15;


//Color Picker

//lighting variables

    
var lightPosition = vec4(1.0, 1.0, 1.0, 0.0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );  //shadow of the shape
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 0.0, 0.0, 1.0, 1.0 );  //pink? is this the color?
var materialDiffuse = vec4( 0.0, 0.0, 1.0, 1.0 );  //color of the shape
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

    createTorus(pAngle,q1Angle,q2Angle,qAngle,radius);
    console.log("points.length = " + points.length);
    adjustPoints(180,11);

    createPath(2,5,10,5);

    

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers for shading per vertex
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
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

    vBuffer = gl.createBuffer();
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
    document.getElementById( "applyButton" ).onclick = function () {
        
        var value = document.getElementById("radiusInput").value;
        if(value != undefined)
            radius = parseInt(value);
        var pAngleValue = document.getElementById("pAngle").value;
        if(pAngle != undefined)
            pAngle = parseInt(pAngleValue);

        var q1AngleValue = document.getElementById("q1Angle").value;
        if(q1Angle != undefined)
            q1Angle = parseInt(q1AngleValue);

        var q2AngleValue = document.getElementById("q2Angle").value;
        if(q2Angle != undefined)
            q2Angle = parseInt(q2AngleValue);

        var qAngleValue = document.getElementById("qAngle").value;
        if(qAngle != undefined)
            qAngle = parseInt(qAngleValue);

        outerSurfacePoints = [];
        normalsArray = [];
        points = [];
        pathArray = [];

        console.log(outerSurfacePoints.length);
        console.log(radius);
        console.log(outerSurfacePoints);


        createTorus(pAngle,q1Angle,q2AngleValue,qAngle,radius);

        adjustPoints(180,11);

        console.log(outerSurfacePoints);
        

        gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
        gl.bufferData( gl.ARRAY_BUFFER, flatten(outerSurfacePoints), gl.STATIC_DRAW );

        gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
        gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );

        render();

    };
    

    
    document.getElementById( "pathButton" ).onclick = function () {
        buttonMode = 3;     
        render();
    };
    document.getElementById( "wireframeButton" ).onclick = function () {
        console.log("wireframe");
        gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
        gl.bufferData( gl.ARRAY_BUFFER, flatten(outerSurfacePoints), gl.STATIC_DRAW );
        buttonMode = 0;
        render();

    };
    document.getElementById( "gouraudButton" ).onclick = function () {
        console.log("gouraudButton");
        buttonMode = 1;
        
        canvas = document.getElementById( "gl-canvas" );

    
        gl = WebGLUtils.setupWebGL( canvas );
        if ( !gl ) { alert( "WebGL isn't available" ); }

        console.log("points.length = " + points.length);
        

        gl.viewport( 0, 0, canvas.width, canvas.height );
        gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
        
        gl.enable(gl.DEPTH_TEST);

        //
        //  Load shaders and initialize attribute buffers for shading per vertex
        //
        program = initShaders( gl, "vertex-shader", "fragment-shader" );
        gl.useProgram( program );

        
        nBuffer = gl.createBuffer();
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
            render();

    };
    document.getElementById( "phongButton" ).onclick = function () {
        console.log("phongButton");
        buttonMode = 2;

        
        canvas = document.getElementById( "gl-canvas" );
    
        gl = WebGLUtils.setupWebGL( canvas );
        if ( !gl ) { alert( "WebGL isn't available" ); }

        //createTorus(2,5,10,5);
        console.log("points.length = " + points.length);
        //adjustPoints(180,11);
    
        gl.viewport( 0, 0, canvas.width, canvas.height );
        gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
        
        gl.enable(gl.DEPTH_TEST);
    
        //
        //  Load shaders and initialize attribute buffers
        //
        program = initShaders( gl, "vertex-shader-phong", "fragment-shader-phong" );
        gl.useProgram( program );
        
    
        ambientProduct = mult(lightAmbient, materialAmbient);
        diffuseProduct = mult(lightDiffuse, materialDiffuse);
        specularProduct = mult(lightSpecular, materialSpecular);
    
            
        var nBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
        gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );
        
        var vNormal = gl.getAttribLocation( program, "vNormal" );
        gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray( vNormal);
    
    
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(outerSurfacePoints), gl.STATIC_DRAW);
        
        var vPosition = gl.getAttribLocation( program, "vPosition");
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);
        
        modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
        projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
        normalMatrixLoc = gl.getUniformLocation( program, "normalMatrix" );
    
    
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
    };

    document.getElementById('colorPicker').addEventListener('init', (instance) => {
        console.log('Event: "init"', instance);
    });
    


    //zoom in and out
    canvas.addEventListener("wheel", function (event) {
        if (event.deltaY > 0) a++;
            else a--;

        projectionMatrix = ortho(-a, a, -a, a, -100, 100);
        gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
    });

    //Camera movement around x y z
    document.addEventListener('keydown', function (event) {


    gl.uniform4fv( gl.getUniformLocation(program, 
        "lightPosition"),flatten(lightPosition) );

        if (event.key === 'w') {
            camRotX1 -=camSpeed;

        }else if(event.key === 's')
        {
            camRotX1 +=camSpeed;

        }else if(event.key === 'd')
        {
            camRotY1 -= camSpeed;
        }else if(event.key === 'a')
        {
            camRotY1 += camSpeed;
        }else if(event.key === 'z')
        {
            camRotZ1 += camSpeed;
        }else if(event.key === 'x')
        {
            camRotZ1 -= camSpeed;
        }                               
    });
        
    render();

}

function adjustPoints(number_of_points_on_knot_curve, number_of_points_on_each_circle){

    triangle(points[(number_of_points_on_knot_curve - 1) * number_of_points_on_each_circle + number_of_points_on_each_circle - 1],
            points[number_of_points_on_each_circle - 1],
            points[(number_of_points_on_knot_curve - 1) * number_of_points_on_each_circle]);

    triangle(points[(number_of_points_on_knot_curve - 1) * number_of_points_on_each_circle] , 
            points[0] , 
            points[number_of_points_on_each_circle - 1]);


    for(i = 0; i < 10; i++){
       
        triangle(points[i], 
                points[(number_of_points_on_knot_curve - 1) * number_of_points_on_each_circle + i + 1], 
                points[(number_of_points_on_knot_curve - 1) * number_of_points_on_each_circle + i]);

        triangle(points[i], 
                points[i + 1],
                points[(number_of_points_on_knot_curve - 1) * number_of_points_on_each_circle + i + 1]);
    }

    for(i = 0; i < number_of_points_on_knot_curve - 1; i++){
        for(j = 0; j < number_of_points_on_each_circle - 1; j++){
            
            triangle(points[i*number_of_points_on_each_circle + j] , 
                    points[i*number_of_points_on_each_circle + j+number_of_points_on_each_circle],
                    points[i*number_of_points_on_each_circle + j+1]);
            
            triangle(points[i*number_of_points_on_each_circle + j+1] , 
                points[i*number_of_points_on_each_circle + j+number_of_points_on_each_circle], 
                points[i*number_of_points_on_each_circle + j+number_of_points_on_each_circle + 1]);  
        }

        triangle(points[i*number_of_points_on_each_circle + j],
                points[i*number_of_points_on_each_circle + j + number_of_points_on_each_circle],
                points[i*number_of_points_on_each_circle + j - number_of_points_on_each_circle + 1]);

        triangle(points[i*number_of_points_on_each_circle + j - number_of_points_on_each_circle + 1],
                points[i*number_of_points_on_each_circle + j+number_of_points_on_each_circle],
                points[i*number_of_points_on_each_circle + j + 1]);

    }    
}

function createTorus(p, q1, q2, q, radius) 
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
            
            xx = (radius * x + Math.cos(v) * x);
            yy = (radius * y + Math.cos(v) * y);
            zz = Math.sin(v) + z;


            temp = vec4(xx,yy,zz,1.0);
            points.push(temp);
        }
    }
    
}


function createPath(p, q1, q2, q) 
{
    var u, v, x, y, z, xx, yy, zz, temp = vec4();
    for(i = 0; i < 360; i+=2)
    {
        u =  i * (Math.PI/180);
        
        x = Math.cos(p*u)*(1 + 0.6*(Math.cos(q1 * u) + 0.75 * Math.cos(q2 * u)));
        y = Math.sin(p*u)*(1 + 0.6*(Math.cos(q1 * u) + 0.75 * Math.cos(q2 * u)));
        z = 0.35*Math.sin(q*u);

        temp = vec4(x,y,z,1.0);
        pathArray.push(temp);

    }
    
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    
    //gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );

    //projectionMatrix = ortho(-a, a, -a, a, -100, 100);

    //eye = vec3(camRotX1,camRotY1,camRotZ1);

    //modelViewMatrix = lookAt(eye,at,up);
    modelViewMatrix = mat4();
    modelViewMatrix = mult(modelViewMatrix, rotate(camRotX1, [1, 0, 0] ));
    modelViewMatrix = mult(modelViewMatrix, rotate(camRotY1, [0, 1, 0] ));
    modelViewMatrix = mult(modelViewMatrix, rotate(camRotZ1, [0, 0, 1] ));

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
    {
        gl.drawArrays( gl.TRIANGLE_STRIP, 0, outerSurfacePoints.length );
    }else if(buttonMode === 2) {
        gl.drawArrays( gl.TRIANGLE_STRIP, 0, outerSurfacePoints.length );

    }else if(buttonMode === 3) {
        gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
        gl.bufferData( gl.ARRAY_BUFFER, flatten(pathArray), gl.STATIC_DRAW );
        gl.drawArrays( gl.LINE_LOOP, 0, pathArray.length );

    }
        
    window.requestAnimFrame( render );
}


