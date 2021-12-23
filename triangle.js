var canvas;
var gl;

var NumVertices  = 36;

var points = [];
var outerSurfacePoints = [];
var colors = [];

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 0;
var theta = [ 0, 0, 0 ];

var thetaLoc;

var flag = true;


let camSpeed = 2;

let MODEL_VIEW_MATRIX;
let PROJECTION_MATRIX;
let modelViewMatrixLoc;

let camRotX1 = 0;
let camRotY1 = 0;
let camRotZ1 = 0;

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

    thetaLoc = gl.getUniformLocation(program, "theta"); 
    
    //event listeners for buttons
    
    document.getElementById( "xButton" ).onclick = function () {
        axis = xAxis;
    };
    document.getElementById( "yButton" ).onclick = function () {
        axis = yAxis;
    };
    document.getElementById( "zButton" ).onclick = function () {
        axis = zAxis;
    };
    document.getElementById("ButtonT").onclick = function(){flag = !flag;};

    
    let a = 15;


    //zoom in and out
    canvas.addEventListener("wheel", function (event) {
        if (event.deltaY > 0) a++;
            else a--;

        PROJECTION_MATRIX = ortho(-a, a, -a, a, -100, 100);
        PROJECTION_MATRIX = mult(PROJECTION_MATRIX, rotate(camRotX1, 1, 0, 0));
        PROJECTION_MATRIX = mult(PROJECTION_MATRIX, rotate(camRotY1, 0, 1, 0));
        PROJECTION_MATRIX = mult(PROJECTION_MATRIX, rotate(camRotZ1, 0, 0, 1));
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "projectionMatrix"), false, flatten(PROJECTION_MATRIX));        
    });

    //CAmera movement around x y z
    document.addEventListener('keydown', function (event) {
        let camRotX = 0;
        let camRotY = 0;
        let camRotZ = 0;
        if (event.key === 'w') {
            camRotX -=camSpeed;
            camRotX1 -=camSpeed;
            PROJECTION_MATRIX = mult(PROJECTION_MATRIX, rotate(camRotX, 1, 0, 0));
            gl.uniformMatrix4fv(gl.getUniformLocation(program, "projectionMatrix"), false, flatten(PROJECTION_MATRIX));        

        }else if(event.key === 's')
        {
            camRotX += camSpeed;
            camRotX1 +=camSpeed;
            PROJECTION_MATRIX = mult(PROJECTION_MATRIX, rotate(camRotX, 1, 0, 0));
            gl.uniformMatrix4fv(gl.getUniformLocation(program, "projectionMatrix"), false, flatten(PROJECTION_MATRIX));        

        }else if(event.key === 'd')
        {
            camRotY -= camSpeed;
            camRotY1 -= camSpeed;
            PROJECTION_MATRIX = mult(PROJECTION_MATRIX, rotate(camRotY, 0, 1, 0));
            gl.uniformMatrix4fv(gl.getUniformLocation(program, "projectionMatrix"), false, flatten(PROJECTION_MATRIX));        
        }else if(event.key === 'a')
        {
            camRotY += camSpeed;
            camRotY1 += camSpeed;

            PROJECTION_MATRIX = mult(PROJECTION_MATRIX, rotate(camRotY, 0, 1, 0));
            gl.uniformMatrix4fv(gl.getUniformLocation(program, "projectionMatrix"), false, flatten(PROJECTION_MATRIX));        
        }else if(event.key === 'z')
        {
            camRotZ += camSpeed;
            camRotZ1 += camSpeed;

            PROJECTION_MATRIX = mult(PROJECTION_MATRIX, rotate(camRotZ, 0, 0, 1));
            gl.uniformMatrix4fv(gl.getUniformLocation(program, "projectionMatrix"), false, flatten(PROJECTION_MATRIX));        
        }else if(event.key === 'x')
        {
            camRotZ -= camSpeed;
            camRotZ1 -= camSpeed;

            PROJECTION_MATRIX = mult(PROJECTION_MATRIX, rotate(camRotZ, 0, 0, 1));
            gl.uniformMatrix4fv(gl.getUniformLocation(program, "projectionMatrix"), false, flatten(PROJECTION_MATRIX));        
        }                               
    });

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    PROJECTION_MATRIX = ortho(-5, 5, -5, 5, -100, 100);
    gl.uniformMatrix4fv( gl.getUniformLocation(program, "projectionMatrix"),  false, flatten(PROJECTION_MATRIX) );
        
    render();
}

function adjustPoints(number_of_points_on_knot_curve, number_of_points_on_each_circle){
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

    if(flag) theta[axis] += 0.0;
    gl.uniform3fv(thetaLoc, theta);

    
    gl.drawArrays( gl.LINE_LOOP, 0, outerSurfacePoints.length );

    requestAnimFrame( render );
}


