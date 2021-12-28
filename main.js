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
var texCoordsArray = [];

var latitude = [];
var longitude = [];
var tempPoint_1 = [];
var tempPoint_2 = [];

//envireoment mapping
var red = new Uint8Array([255, 0, 0, 255]);
var green = new Uint8Array([0, 255, 0, 255]);
var blue = new Uint8Array([0, 0, 255, 255]);
var cyan = new Uint8Array([0, 255, 255, 255]);
var magenta = new Uint8Array([255, 0, 255, 255]);
var yellow = new Uint8Array([255, 255, 0, 255]);

var cubeMap;

var va = vec4(0.0, 0.0, -1.0,1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333,1);

//Color Picker
var colorChosen;

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
var texSize = 128;


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

function textTriangle(a, b) { 

    texCoordsArray.push(a);
    texCoordsArray.push(b);      
}

var image1 = new Array()
    for (var i =0; i<texSize; i++)  image1[i] = new Array();
    for (var i =0; i<texSize; i++) 
        for ( var j = 0; j < texSize; j++) 
           image1[i][j] = new Float32Array(4);
    for (var i =0; i<texSize; i++) for (var j=0; j<texSize; j++) {
        var c = (((i & 0x8) == 0) ^ ((j & 0x8)  == 0));
        image1[i][j] = [c, c, c, 1];
    }

// Convert floats to ubytes for texture

var image2 = new Uint8Array(4*texSize*texSize);

    for ( var i = 0; i < texSize; i++ ) 
        for ( var j = 0; j < texSize; j++ ) 
           for(var k =0; k<4; k++) 
                image2[4*texSize*i+4*j+k] = 255*image1[i][j][k];
        


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

function configureCubeMap() {

    cubeMap = gl.createTexture();

    gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeMap);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X ,0,gl.RGBA,
       1,1,0,gl.RGBA,gl.UNSIGNED_BYTE, red);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X ,0,gl.RGBA,
       1,1,0,gl.RGBA,gl.UNSIGNED_BYTE, green);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y ,0,gl.RGBA,
       1,1,0,gl.RGBA,gl.UNSIGNED_BYTE, blue);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y ,0,gl.RGBA,
       1,1,0,gl.RGBA,gl.UNSIGNED_BYTE, cyan);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z ,0,gl.RGBA,
       1,1,0,gl.RGBA,gl.UNSIGNED_BYTE, yellow);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z ,0,gl.RGBA,
       1,1,0,gl.RGBA,gl.UNSIGNED_BYTE, magenta);
    

    gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_MIN_FILTER,gl.NEAREST);
}

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );

    gradientCanvas = document.getElementById("gl-canvas-gradient");
    gl_gradient = WebGLUtils.setupWebGL(gradientCanvas);

    if ( !gl ) { alert( "WebGL isn't available" ); }

    
    var verticesGradient = [
        vec2(-1.0, -1.0),
        vec2(-1.0, 1.0),
        vec2(1.0, 1.0),
        vec2(1.0, -1.0)
    ];

    var vertexColorsGradient = [
        vec4(0.0, 0.0, 0.0, 1.0),  // black
        vec4(1.0, 1.0, 1.0, 1.0),  // white
        vec4(0.0, 0.0, 0.0, 1.0),  // black
    ];


    createTorus(pAngle,q1Angle,q2Angle,qAngle,radius);
    console.log("points.length = " + points.length);
    adjustPoints(180,11);
    adjustTextureCoor(1080,11);

    createPath(2,5,10,5);

    

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers for shading per vertex
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    var program_gradient = initShaders(gl_gradient, "vertex-shader-gradient", "fragment-shader-gradient");

    gl.useProgram( program );
    gl_gradient.useProgram(program_gradient);


    
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

    var tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW );
    var vTexCoord = gl.getAttribLocation( program, "vTexCoord");
    gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTexCoord);

    configureTexture(image2);
    /*
    configureCubeMap();
    gl.activeTexture( gl.TEXTURE0 );
    gl.uniform1i(gl.getUniformLocation(program, "texMap"),0); 
    */
    
    projectionMatrix = ortho(-15, 15, -15, 15, -100, 100);
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );

    modelViewMatrix = lookAt(eye, at , up);
    

    
    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);

    //For gl_gradient

    var vBufferGradient = gl_gradient.createBuffer();
    gl_gradient.bindBuffer(gl_gradient.ARRAY_BUFFER, vBufferGradient);
    gl_gradient.bufferData(gl_gradient.ARRAY_BUFFER, flatten(verticesGradient), gl_gradient.STATIC_DRAW);

    var vPositionGradient = gl_gradient.getAttribLocation(program_gradient, "vPosition");
    gl_gradient.vertexAttribPointer(vPositionGradient, 2, gl.FLOAT, false, 0, 0);
    gl_gradient.enableVertexAttribArray(vPositionGradient);

    var cBufferGradient = gl_gradient.createBuffer();
    gl_gradient.bindBuffer(gl_gradient.ARRAY_BUFFER, cBufferGradient);
    gl_gradient.bufferData(gl_gradient.ARRAY_BUFFER, 16 * 3000, gl_gradient.STATIC_DRAW);

    var vColorGradient = gl_gradient.getAttribLocation(program_gradient, "vColor");
    gl_gradient.vertexAttribPointer(vColorGradient, 4, gl.FLOAT, false, 0, 0);
    gl_gradient.enableVertexAttribArray(vColorGradient);


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

    
    //Pick a Color

    gradientSlider = document.getElementById("gradientColorRange");
    //GRadient Slider for Color Change
    gradientSlider.onchange = function () {
        hue = event.srcElement.value;
        gl_gradient.bindBuffer(gl_gradient.ARRAY_BUFFER, cBufferGradient);

        var c = 1.0;
        var x = c * (1.0 - Math.abs(((hue / 60.0) % 2) - 1.0));
        var m = 0.0;
        if (hue <= 60) {
            rC = c;
            gC = x;
            bC = 0;
        } else if (hue <= 120) {
            rC = x;
            gC = c;
            bC = 0;

        } else if (hue <= 180) {
            rC = 0;
            gC = c;
            bC = x;

        } else if (hue <= 240) {
            rC = 0;
            gC = x;
            bC = c;

        } else if (hue <= 300) {
            rC = x;
            gC = 0;
            bC = c;
        } else if (hue <= 360) {
            rC = c;
            gC = 0;
            bC = x;
        }

        var rColor = vec4(rC, gC, bC, 1.0);
        colorG = [vertexColorsGradient[0], vertexColorsGradient[1], rColor, vertexColorsGradient[2]];
        gl_gradient.bufferData(gl_gradient.ARRAY_BUFFER, flatten(colorG), gl_gradient.STATIC_DRAW);
        render();
    };

    gradientCanvas.addEventListener("mousedown", function (event) {
        render();
        fromButtons = 0;
        var pixels = new Uint8Array(4);

        gl_gradient.readPixels((event.clientX - 900), (900 - event.clientY), 1, 1, gl_gradient.RGBA, gl_gradient.UNSIGNED_BYTE, pixels);

        console.log((event.clientY));

        console.log(pixels);

        var br = pixels[0] / 256;
        var bg = pixels[1] / 256;
        var bb = pixels[2] / 256;


        colorChosen = vec4(br, bg, bb, 1.0);

        materialAmbient = colorChosen;
        materialDiffuse = colorChosen;
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
    
        document.getElementById("cardColor").style.backgroundColor = 'red';

        render();
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

function adjustTextureCoor(number_of_points_on_knot_curve, number_of_points_on_each_circle){
    var innerLoop = 0;
    for( i = 0; i < number_of_points_on_knot_curve; i+=1){
        for(j = 0; j < number_of_points_on_each_circle; j+=4){
            //texCoordsArray.push(vec2(4*i,4*j));
        }
        innerLoop++;
    }
    console.log(innerLoop);
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
    gl_gradient.clear(gl_gradient.COLOR_BUFFER_BIT);

    gl_gradient.drawArrays(gl_gradient.TRIANGLE_FAN, 0, 4);
    
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


