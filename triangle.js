
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
    adjustPoints();
    console.log("outerSurfacePoints.length = " + outerSurfacePoints.length);


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
//creates the outer surface of torus knot 
function adjustPoints(){
    var vertexColors = [
        [ 0.0, 0.0, 0.0, 1.0 ],  // black
        [ 1.0, 0.0, 0.0, 1.0 ],  // red
        
    ];

    for(i = 0; i < points.length - 12; i++){
        outerSurfacePoints.push(points[i]);
        outerSurfacePoints.push(points[i + 1]);
        outerSurfacePoints.push(points[i + 11]);
        outerSurfacePoints.push(points[i + 12]);
        colors.push(vertexColors[1]);
        colors.push(vertexColors[1]);
        colors.push(vertexColors[1]);
        colors.push(vertexColors[1]);
    }
    
    for(i = 11; i>1; i--){
        outerSurfacePoints.push(points[points.length - i]);
        outerSurfacePoints.push(points[points.length - i + 1]);
        outerSurfacePoints.push(points[11 - i]);
        outerSurfacePoints.push(points[12 - i]);
        colors.push(vertexColors[1]);
        colors.push(vertexColors[1]);
        colors.push(vertexColors[1]);
        colors.push(vertexColors[1]);
    }
    outerSurfacePoints.push(points[points.length - 1]);
    outerSurfacePoints.push(points[points.length - 11]);
    outerSurfacePoints.push(points[10]);
    outerSurfacePoints.push(points[11]);
    colors.push(vertexColors[1]);
    colors.push(vertexColors[1]);
    colors.push(vertexColors[1]);
    colors.push(vertexColors[1]);

}

function createTorus(pp, qq1, qq2, m1) 
{
    for(var i = 0; i < 360; i+=2)
    {
        var u =  i * (Math.PI/180);
        var rr = Math.cos(m1*u)+2;

        
        var x = Math.cos(pp*u)*(1 + 0.6*(Math.cos(qq1 * u)));
        var y = Math.sin(pp*u)*(1 + 0.6*(Math.cos(qq1 * u)));
        var z = 0.35*Math.sin(5*u);
        /*
        var temp = vec4(x,y,z,1);
        points.push(temp);
        colors.push(vertexColors[1]);
        count++;*/
        
        
        for(var j = 0; j <= 360; j+=36)
        {
            var v =  j * (Math.PI/180);

            var xx=rr*Math.cos(pp*u);
            var yy=rr*Math.sin(pp*u);
            var zz=-3*Math.sin(qq1*u);
            
            xPrime=(4*xx+Math.cos(v)*xx/rr);
            yPrime=(4*yy+Math.cos(v)*yy/rr);
            zPrime=Math.sin(v)+zz/rr;

            var temp = vec4(xPrime,yPrime,zPrime,1.0);
            
            points.push(temp);
        }
    }
    
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if(flag) theta[axis] += 0.0;
    gl.uniform3fv(thetaLoc, theta);

    
    for(i = 0; i < outerSurfacePoints.length; i+=4){
        gl.drawArrays( gl.TRIANGLES, i, (i+3) );
    }

    requestAnimFrame( render );
}

