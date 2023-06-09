
document.body.innerHTML = '<style>div{color: grey;font-family:cursive;text-align:center;position:absolute;margin:auto;top:0;right:0;bottom:0;left:0;width:300px;height:100px;}</style><body><div id="loading"><h1>GENERATING</h1><p>This could take a while, please give it at least 5 minutes to render.</p></div></body>';
paper.install(window);
window.onload = function() {

document.body.innerHTML = '<style>body {margin: 0px;text-align: center;}</style><canvas resize="true" style="display:block;width:100%;" id="myCanvas"></canvas>';

var canvas = document.getElementById("myCanvas");

paper.setup('myCanvas');
paper.activate();

console.log(tokenData.hash)

canvas.style.background = "white";

//Set a seed value for Perlin
var seed = ~~(R.random_dec()*100000000000000000);

//initialize perlin noise 
var noise = new perlinNoise3d();
noise.noiseSeed(seed);

//fxparams
$fx.params([
  {
    id: "number_ripples",
    name: "Ripples",
    type: "number",
    default: 2,
    options: {
      min: 0,
      max: 25,
      step: 1,
    },
  },
  {
    id: "number_colors",
    name: "Colors",
    type: "number",
    default: 3,
    options: {
      min: 1,
      max: 12,
      step: 1,
    },
  },
  {
    id: "number_layers",
    name: "Layers",
    type: "number",
    default: 12,
    options: {
      min: 8,
      max: 14,
      step: 1,
    },
  },
  {
    id: "background",
    name: "Background style",
    type: "number",
    default: 0,
    options: {
      min: 0,
      max: 6,
      step: 1,
    },
  },
  {
    id: "density",
    name: "Density",
    type: "number",
    default: 8,
    options: {
      min: 1,
      max: 15,
      step: 1,
    },
  },
  {
    id: "orientation",
    name: "Orientation",
    type: "select",
    default: "Portrait",
    options: {
      options: ["Portrait", "Landscape", "Square"],
    }
  },
])

//Set the properties for the artwork where 100 = 1 inch
var wide = 800; 
var high = 1000; 
var ratio = 1/2;//use 1/4 for 32x40 - 1/3 for 24x30 - 1/2 for 16x20 - 1/1 for 8x10
var scale  = new URLSearchParams(window.location.search).get('scale'); //read width query string
if (scale){ratio = 1/scale};

var minOffset = ~~(7*ratio); //this is aproximatly .125"
var framewidth = ~~(100*ratio); 
if (ratio<.5){framewidth = ~~(150*ratio); }//use 1.5" frame for larger 
var framradius = 0;
var stacks = R.random_int(8, 16);
stacks = $fx.getParam("number_layers");
console.log(stacks+" layers");


//read settings from query string
var qx = new URLSearchParams(window.location.search).get('x'); //read width query string
var qy = new URLSearchParams(window.location.search).get('y'); //read height query 
var laserwide  = new URLSearchParams(window.location.search).get('lw'); //read height query string
var laserhigh  = new URLSearchParams(window.location.search).get('lh'); //read height query string

var colors = []; var palette = []; 

numofcolors = R.random_int(1, 6); //Sets the number of colors to pick for the pallete
numofcolors = $fx.getParam("number_colors"); 
console.log(numofcolors+" colors");

//Randomly adjust the canvas dimensions
w=wide;h=high;
if ($fx.getParam("orientation")=="Landscape"){wide = h;high = w;orientation="Landscape";}
else if ($fx.getParam("orientation")=="Square"){wide = w;high = w;orientation="Square";}
else {wide = w;high = h;orientation="Portrait";}
console.log(orientation+': '+~~(wide/100/ratio)+' x '+~~(high/100/ratio))   

//setup the project variables
var numberofcircles=R.random_int(1, 7);console.log('flowers: '+numberofcircles);
numberofcircles=$fx.getParam("number_ripples");
var meshDensity = R.random_int(5, 15);console.log('meshDensity: '+meshDensity);
meshDensity = $fx.getParam("density"); 
var xwav = R.random_int(20, 40);console.log('xwav: '+xwav);//xwav = 20;
var ywav = R.random_int(9, 23);console.log('ywav: '+ywav);//ywav = 17;
var xoss = 1.10+R.random_dec()*.3;console.log('xoss: '+xoss);//xoss = 1.10
var yoss = 1.05+R.random_dec()*.3;console.log('yoss: '+yoss);//yoss = 1.16
var lspread = R.random_int(15, 65);console.log('lineSpread: '+lspread);
var backgroundStyle = R.random_int(0, 6);console.log('backgroundstyle: '+backgroundStyle);
backgroundStyle = $fx.getParam("background"); 
var raining = R.random_int(0, 10);console.log('rain: '+raining);


cc=[];cr=[];p=0;hoset=[];
rt = (wide+high)/4
for (i=0;i<=numberofcircles;i++){
    cc[i]=new Point(~~(R.random_dec()*wide),~~(R.random_dec()*high));
    cr[i]=~~(rt/6+R.random_dec()*rt/2);
    hoset[i] =  R.random_int(10, 40)*ratio;
}

//Pick layer colors from a random pallete based on tint library
for (var c=0; c<numofcolors; c=c+1){palette[c] = tints[R.random_int(0, tints.length-1)];};    

//randomly assign colors to layers
for (var c=0; c<stacks; c=c+1){colors[c] = palette[R.random_int(0, palette.length)];};

//or alternate colors
p=0;for (var c=0; c<stacks; c=c+1){colors[c] = palette[p];p=p+1;if(p==palette.length){p=0};}
    
//Set the line color
linecolor={"Hex":"#292831","Name":"Black"};

//read settings from query string
var qx  = new URLSearchParams(window.location.search).get('x'); //read width query string
var qy  = new URLSearchParams(window.location.search).get('y'); //read height query 
var laserwide  = new URLSearchParams(window.location.search).get('lw'); //read height query string
var laserhigh  = new URLSearchParams(window.location.search).get('lh'); //read height query string
var screwHoles = new URLSearchParams(window.location.search).get('screws');//if == true draw chicago screw holes

//Override canvas sizes based on query strings  
if (qx){wide=parseInt(qx)};   
if (qy){high=parseInt(qy)}; 


// Set a canvas size for when layers are exploded where 100=1in
var panelWide = 3000;
var panelHigh = 2400;
//Override explode canvas sizes based on query strings  
if (laserhigh){panelHigh=parseInt(laserhigh)};  
if (laserwide){panelWide=parseInt(laserwide)};  

paper.view.viewSize.width = 2400;
paper.view.viewSize.height = 2400;


//************* Draw the layers ************* 

sheet = []; //This will hold each layer

var px=0;var py=0;var pz=0;var prange=.6; 

// iterate through and draw each layer in the stacks
for (z = 0; z < stacks; z++) {
    pz=pz+prange;

    drawFrame(z); // Draw the initial frame
    if (z!= stacks-1){
        
        if (backgroundStyle == 0){vertLines(z,meshDensity,lspread);var backgrounds = "Vertical Lines";}
        if (backgroundStyle == 1){horzLines(z,meshDensity,lspread);var backgrounds = "Horizontal Lines";}
        if (backgroundStyle == 2){hexGrid(z,meshDensity);var backgrounds = "Hex";}
        if (backgroundStyle == 3){ringGrid(z,meshDensity);var backgrounds = "Rings";}
        if (backgroundStyle == 4){diamondGrid(z,meshDensity);var backgrounds = "Diamonds";}
        if (backgroundStyle == 5){triGrid(z,meshDensity);var backgrounds = "Triangles";}
        if (backgroundStyle > 5){horzWaveLines(z,meshDensity,xwav,ywav,xoss,yoss);var backgrounds = "Waves";}
        if (raining > 5 && backgroundStyle != 0){vertLines(z,meshDensity,lspread);}
        holePortal(z);
    }  
        
    frameIt(z);cutMarks(z);hanger(z);// finish the layer with a final frame cleanup and cut marks
    if (z == stacks-1) {signature(z);}// sign the top layer
    sheet[z].scale(2.3);
    sheet[z].position = new Point(1200, 1200);
    var group = new Group(sheet[z]);
    
    console.log(z)//Show layer completed in console


    

    
    
}//end z loop

//--------- Finish up the preview ----------------------- 

    // Build the features and trigger an fxhash preview
    var features = {};
    features.Ripples = numberofcircles;
    features.Background = backgrounds;
    features.Orientation = orientation;
    for (l=stacks;l>0;l--){
    var key = "layer: "+(stacks-l+1)
    features[key] = colors[l-1].Name
    }
    console.log(features);
    $fx.features(features);
    //fxpreview();


//vvvvvvvvvvvvvvv PROJECT FUNCTIONS vvvvvvvvvvvvvvv 
function holePortal(z){
    
    for (p=0;p<numberofcircles;p++){
        var pp=pp+prange;   
        var ocircle = new Path.Circle(cc[p], cr[p]);
        var icircle = new Path.Circle(cc[p], cr[p]-~~((stacks-z-1)*hoset[p]));
        sheet[z] = sheet[z].subtract(icircle);
        project.activeLayer.children[project.activeLayer.children.length-1].remove();
        c = ocircle.subtract(icircle);
        ocircle.remove();icircle.remove();
        sheet[z] = c.unite(sheet[z]);
        c.remove();  
        project.activeLayer.children[project.activeLayer.children.length-2].remove();
    }
}



function horzLines(z,ls,shake) {
    var spacing = ~~((high)/(ls));
    for (l=1;l<ls+1;l++){
        p = []
        y = ~~(l*spacing+rangeInt(~~(shake/ratio),l,z+1));
        p[0]=new Point(framewidth/2,y)
        y2 = ~~(l*spacing+rangeInt(~~(shake/ratio),l+10,z+10))
        p[1]=new Point(wide-framewidth/2,y2)
        lines = new Path.Line (p[0],p[1]); 
        mesh = PaperOffset.offsetStroke(lines, minOffset,{ cap: 'butt' });
        mesh.flatten(4);
        mesh.smooth();
        lines.remove();
        join(z,mesh); 
        mesh.remove();
    }
}

function vertLines(z,ls,shake) {
    //z is the layer to render it to
    //ls is the number of lines to draw
    //shake is the variance of the start and end points
    var spacing = ~~((wide)/(ls));
    for (l=1;l<ls+1;l++){
        p = []
        x = ~~(l*spacing+rangeInt(~~(shake/ratio),l,z+1));
        p[0]=new Point(x,framewidth/2)
        x2 = ~~(l*spacing+rangeInt(~~(shake/ratio),l+10,z+10))
        p[1]=new Point(x2,high-framewidth/2)
        lines = new Path.Line (p[1],p[0]);
        mesh = PaperOffset.offsetStroke(lines, minOffset,{ cap: 'butt' });
        mesh.flatten(4);
        mesh.smooth();
        lines.remove();
        join(z,mesh); 
        mesh.remove();
    }
}

function hexGrid(z,across){
    //z is the layer to render it to
    //across is the number of hexs to draw across the width
    radius = ~~(wide/((3/2*across)));
    oset = ~~(radius/(stacks-1));
    ystart = ~~(high%(Math.sqrt(3)*radius))/2
    r=0;
    for (y=ystart;y<high;y=y+~~(Math.sqrt(3)*radius)/2){
        //if (r%2 == 0) {xstart=~~(3/2*radius)}else{xstart=~~(3/2*radius)*2}
        if (r%2 == 0) {xstart=~~(3/2*radius)}else{xstart=~~(3/2*radius)*2}
        for (x=xstart;x<wide;x=x+~~(3/2*radius)*2){
            center = new Point(x, y);
            sides = 6; 
            hex=new Path.RegularPolygon(center, sides, radius);
            hex.rotate(30)
            mesh = PaperOffset.offsetStroke(hex, ~~(minOffset+oset*(stacks-z-2)),{ cap: 'butt' });
            hex.remove();
            join(z,mesh); 
            mesh.remove();
        }
        r++
    }
}

function ringGrid(z,across){
    var radius = ~~(wide/(Math.sqrt(3)*across));
    var oset = ~~(radius/stacks+3);
    var ystart = ~~((high%(radius*2))/2)
    r=0;
    for (y=ystart;y<high;y=y+radius){
        //if (r%2 == 0) {xstart=~~(3/2*radius)}else{xstart=~~(3/2*radius)*2}
        if (r%2 == 0) {var xstart=radius+radius*Math.sqrt(3)}else{var xstart=radius}
        for (x=xstart;x<wide+radius;x=x+radius*Math.sqrt(3)*2){
            center = new Point(x, y);
            sides = 6; 
            path = new Path.Circle(center, radius);
            mesh = PaperOffset.offsetStroke(path, ~~(minOffset+oset*(stacks-z-2)),{ cap: 'butt' });
            path.remove();
            join(z,mesh); 
            mesh.remove();
        }
        r++
    }
}


function diamondGrid(z,across){
    radius = ~~(wide/(across*2));
    oset = ~~(radius/stacks);
    ystart = ~~(high%radius/2)
    r=0;
    for (y=ystart;y<high;y=y+radius){
        //if (r%2 == 0) {xstart=~~(3/2*radius)}else{xstart=~~(3/2*radius)*2}
        if (r%2 == 0) {xstart=radius}else{xstart=radius*2}
        for (x=xstart;x<wide;x=x+radius*2){
            center = new Point(x, y);
            sides = 4; 
            hex=new Path.RegularPolygon(center, sides, radius);
            hex.rotate(45)
            mesh = PaperOffset.offsetStroke(hex, ~~(minOffset+oset*(stacks-z-2)),{ cap: 'butt' });
            hex.remove();
            join(z,mesh); 
            mesh.remove();
        }
        r++
    }
}

function triGrid(z,across){
    radius = ~~(wide/(across));
    oset = ~~((radius*Math.cos(0.523599))/stacks-1);
    ystart = ~~(high%(radius*Math.cos(0.523599))/2)
    r=0;
    for (y=ystart;y<high+radius;y=y+3/2*radius){
        if (r%2 == 0) {xstart=radius*Math.cos(0.523599)}else{xstart=-radius*Math.cos(0.523599)*2}
        for (x=xstart;x<wide+radius;x=x+radius*Math.cos(0.523599)*2){
            center = new Point(x, y);
            sides = 3;  
                hex=new Path.RegularPolygon(center, sides, radius);
                mesh = PaperOffset.offsetStroke(hex, ~~(minOffset+oset*(stacks-z-2)),{ cap: 'butt' });
                hex.remove();
                join(z,mesh); 
                mesh.remove();
        }
        r++
    }
}

function horzWaveLines(z,ls,xinit,yinit,xamp,yamp) {
    shift = ~~(high/(ls+1));
    oset = ~~(high/(ls+2)/stacks);
    var path = new Path();
    path.add(new Point(0, 0));
    var y = ~~(yinit*ratio);
    for (var x = ~~(xinit*ratio); x < wide;) {
        y *= -yamp; y=~~(y);
        x *= xamp;x=~~(x);
        path.lineBy(x, y);
    }
    path.smooth({ type: 'catmull-rom', factor: 0.5 });
    for (l=1;l<ls+2;l++){
        path.position.y += shift;
        mesh = PaperOffset.offsetStroke(path, ~~(minOffset+oset*(stacks-z-2)),{ cap: 'butt' });
        mesh.closed = 'true';
        sheet[z] = (mesh.unite(sheet[z]));
        mesh.remove();
    }
    path.remove();
}

//^^^^^^^^^^^^^ END PROJECT FUNCTIONS ^^^^^^^^^^^^^ 




//--------- Helper functions ----------------------- 



function rangeInt(range,x,y,z){
    var v = ~~(range-(noise.get(x,y,z)*range*2));
    return (v);
}

// Add a shape s to sheet z
function join(z,s){
    sheet[z] = (s.unite(sheet[z]));
    s.remove();
    project.activeLayer.children[project.activeLayer.children.length-2].remove();
}

// Subtract a shape s from sheet z
function cut(z,s){
    sheet[z] = sheet[z].subtract(s);
    s.remove();
    project.activeLayer.children[project.activeLayer.children.length-2].remove();
}

function drawFrame(z){
    var outsideframe = new Path.Rectangle(new Point(0, 0),new Size(wide, high), framradius)
    var insideframe = new Path.Rectangle(new Point(framewidth, framewidth),new Size(wide-framewidth*2, high-framewidth*2)) 
    sheet[z] = outsideframe.subtract(insideframe);
    outsideframe.remove();insideframe.remove();
}


function solid(z){ 
    outsideframe = new Path.Rectangle(new Point(1,1),new Size(wide-1, high-1), framradius)
    sheet[z] = sheet[z].unite(outsideframe);
    outsideframe.remove();
    project.activeLayer.children[project.activeLayer.children.length-2].remove();
}



function frameIt(z){
        //Trim to size
        var outsideframe = new Path.Rectangle(new Point(0, 0),new Size(wide, high), framradius)
        sheet[z] = outsideframe.intersect(sheet[z]);
        outsideframe.remove();
        project.activeLayer.children[project.activeLayer.children.length-2].remove();

        //Make sure there is still a solid frame
        var outsideframe = new Path.Rectangle(new Point(0, 0),new Size(wide, high), framradius)
        var insideframe = new Path.Rectangle(new Point(framewidth, framewidth),new Size(wide-framewidth*2, high-framewidth*2)) 
        var frame = outsideframe.subtract(insideframe);
        outsideframe.remove();insideframe.remove();
        sheet[z] = sheet[z].unite(frame);
        frame.remove();
        project.activeLayer.children[project.activeLayer.children.length-2].remove();
        // Add some holes to secure it together
        if (screwHoles=='true'){chicagoScrews(z);}    
        
        sheet[z].style = {fillColor: colors[z].Hex, strokeColor: linecolor.Hex, strokeWidth: 1*ratio,shadowColor: new Color(0,0,0,[0.3]),shadowBlur: 20,shadowOffset: new Point((stacks-z)*2.3, (stacks-z)*2.3)};
}

function cutMarks(z){
    if (z<stacks-1) {
          for (etch=0;etch<stacks-z;etch++){
                var layerEtch = new Path.Circle(new Point(50+etch*10,25),2)
                cut(z,layerEtch)
            } 
        }
}

function signature(z){
    shawn = new CompoundPath(sig);
    shawn.strokeColor = 'green';
    shawn.fillColor = 'green';
    shawn.strokeWidth = 1;
    shawn.scale(ratio)
    shawn.position = new Point(wide-framewidth-~~(shawn.bounds.width/2), high-framewidth+~~(shawn.bounds.height));
    cut(z,shawn)
}

function hanger (z){
    if (z < stacks-2){
        var r = 30*ratio;
        if (z<3){r = 19*ratio}
        var layerEtch = new Path.Circle(new Point(wide/2,framewidth/2),r)
        cut(z,layerEtch)
        var layerEtch = new Path.Circle(new Point(wide/2,high-framewidth/2),r)
        cut(z,layerEtch)
        var layerEtch = new Path.Circle(new Point(framewidth/2,high/2),r)
        cut(z,layerEtch)
        var layerEtch = new Path.Circle(new Point(wide-framewidth/2,high/2),r)
        cut(z,layerEtch)
    }
}




//--------- Interaction functions -----------------------

document.addEventListener('keypress', (event) => {

       //Save as SVG 
       if(event.key == "s") {
            fileName = tokenData.hash;
            var url = "data:image/svg+xml;utf8," + encodeURIComponent(paper.project.exportSVG({asString:true}));
            var key = [];for (l=stacks;l>0;l--){key[stacks-l] = colors[l-1].Name;}; 
            var svg1 = "<!--"+key+"-->" + paper.project.exportSVG({asString:true})
            var url = "data:image/svg+xml;utf8," + encodeURIComponent(svg1);
            var link = document.createElement("a");
            link.download = fileName;
            link.href = url;
            link.click();
            }


       //Format for Lightburn
       if(event.key == "b") {
            for (z=0;z<stacks;z++){sheet[z].style = {fillColor: null,strokeWidth: .1,strokeColor: lightburn[stacks-z-1].Hex,shadowColor: null,shadowBlur: null,shadowOffset: null}}
            }
        
        //Save as PNG
        if(event.key == "p") {
            canvas.toBlob(function(blob) {saveAs(blob, tokenData.hash+'.png');});
            }

        //Export colors as txt
        if(event.key == "t") {
            var key = [];
            for (l=stacks;l>0;l--){
                key[stacks-l] =  colors[l-1].Name;
            }; 
            console.log(key.reverse())
            var content = JSON.stringify(key)
            var filename = tokenData.hash + ".txt";
            var blob = new Blob([content], {type: "text/plain;charset=utf-8"});
            saveAs(blob, filename);
            }

       //Explode the layers     
       if(event.key == "e") {     
            h=0;t=0;maxwidth=3000;
               for (z=0; z<sheet.length; z++) { 
               sheet[z].scale(1000/2300)   
               sheet[z].position = new Point(wide/2,high/2);        
                    sheet[z].position.x += wide*h;
                    sheet[z].position.y += high*t;
                    sheet[z].selected = true;
                    if (wide*(h+2) > panelWide) {maxwidth=wide*(h+1);h=0;t++;} else{h++};
                    }  
            paper.view.viewSize.width = maxwidth;
            paper.view.viewSize.height = high*(t+1);
           }
 
}, false); 
}