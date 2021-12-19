
var canvas;
var gl;

var NumVertices  = 36;

var points = [];
var colors = [];

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 0;
var theta = [ 0, 0, 0 ];

var thetaLoc;
var count = 0;

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

    colorCube();

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
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
    

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
    PROJECTION_MATRIX = ortho(-15, 15, -15, 15, -100, 100);
    gl.uniformMatrix4fv( gl.getUniformLocation(program, "projectionMatrix"),  false, flatten(PROJECTION_MATRIX) );
    
        
    render();
}

function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

function quad(a, b, c, d) 
{
    var vertices = [
        vec4( -0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5,  0.5,  0.5, 1.0 ),
        vec4(  0.5,  0.5,  0.5, 1.0 ),
        vec4(  0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5, -0.5, -0.5, 1.0 ),
        vec4( -0.5,  0.5, -0.5, 1.0 ),
        vec4(  0.5,  0.5, -0.5, 1.0 ),
        vec4(  0.5, -0.5, -0.5, 1.0 )
    ];

    var vertexColors = [
        [ 0.0, 0.0, 0.0, 1.0 ],  // black
        [ 1.0, 0.0, 0.0, 1.0 ],  // red
        [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
        [ 0.0, 1.0, 0.0, 1.0 ],  // green
        [ 0.0, 0.0, 1.0, 1.0 ],  // blue
        [ 1.0, 0.0, 1.0, 1.0 ],  // magenta
        [ 0.0, 1.0, 1.0, 1.0 ],  // cyan
        [ 1.0, 1.0, 1.0, 1.0 ]   // white
    ];

    // We need to parition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices
    
    //vertex color assigned by the index of the vertex
    
    var indices = [ a, b, c, a, c, d ];

    for(var i = 0; i < 360; i++)
    {
        var u =  i * (Math.PI/180);
        var phi = radians;
        var pp = 2;
        var qq = 5;
        var rr = Math.cos(qq*phi)+2;

        
        var x = Math.cos(2*radians)*(1 + 0.6*(Math.cos(5*radians)+0.75*Math.cos(10*radians)));
        var y = Math.sin(2*radians)*(1 + 0.6*(Math.cos(5*radians)+0.75*Math.cos(10*radians)));
        var z = 0.35*Math.sin(5*radians);

        var temp = vec4(x,y,z,1.0);
            colors.push(vertexColors[3]);
            count++;
            points.push(temp);
        
        
        for(var j = 0; j < 360; j++)
        {
            var v =  j * (Math.PI/180);
            
            
            var xPrime =  4*Math.cos(2*u)*(1+0.6*(Math.cos(5*u)+0.75*Math.cos(10*u)))+Math.cos(v)*Math.cos(2*u)*(1+0.6*(Math.cos(5*u)+0.75*Math.cos(10*u)));
            var yPrime = 4*Math.sin(2*u)*(1+0.6*(Math.cos(5*u)+0.75*Math.cos(10*u)))+Math.cos(v)*Math.sin(2*u)*(1+0.6*(Math.cos(5*u)+0.75*Math.cos(10*u)));
            var zPrime =  Math.sin(v)+0.35*Math.sin(5*u);
            
            
            var temp = vec4(xPrime,yPrime,zPrime,1.0);
            colors.push(vertexColors[1]);
            count++;
            points.push(temp);
        }
        
        
    }
    
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if(flag) theta[axis] += 0.0;
    gl.uniform3fv(thetaLoc, theta);
    
    gl.drawArrays( gl.LINE_STRIP, 0, count );

    requestAnimFrame( render );
}

