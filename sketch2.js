const flock = [];

var alignSlider, cohesionSlider, separationSlider;
var dance = 0;
var fftSize = 1024;
var numBins = fftSize / 2;
var sampleRate = 44100;

var fft = new maximJs.maxiFFT();
var samplePlayer = new maximJs.maxiSample();

var startSecs = 0;
var endSecs = 675; // 6mins 15 ... the length of the track
var dur = 675;

//var lightCols;
//var lightLevels = [0,0,0,0];


//red
var range_0 = [0, 1];
var total_0 = 0;
var lightMean_0 = 0;


//pink
var range_1 = [50, 80];
var total_1 = 0;
var lightMean_1 = 0;

//green
var range_2 = [160, 180];
var total_2 = 0;
var lightMean_2 = 0;

//blue
var range_3 = [3, 8];
var total_3 = 0;
var lightMean_3 = 0;


var kickEnvF = new maximEx.envFollower();
var auraEnvF = new maximEx.envFollower();
var hihatEnvF = new maximEx.envFollower();
var drumEnvF = new maximEx.envFollower();

var strength = 500.0;
var step = 15;
var noiseScale = 0.0027;

var audioContext;
var audioInit;
var img;
var qt;
let quadTree;

var object;
var image;

function preload() {

    song = loadSound('assets/Fantasy.mp3');
    
    img = loadImage("assets/bug.svg");
    liquid = loadImage('assets/plasma.jpg');
    object = loadModel('assets/tcellhead.obj');
    memphis = loadImage('assets/black-hole.jpeg');
}


function setup() {


    createCanvas(1024, 768);
    quadTree = new QuadTree(Infinity, 50, new Rect(0, 0, width, height));

    object = createGraphics(100, 100, WEBGL);

    createP("alignment slider");
    alignSlider = createSlider(0, 5, 1, 0.1);

    createP("cohesion slider");
    cohesionSlider = createSlider(0, 5, 1, 0.1);

    createP("separation slider");
    separationSlider = createSlider(0, 5, 1, 0.1);

    audioContext = new maximJs.maxiAudio();
    audioContext.play = playLoop;
    audioInit = false;

    createCanvas(windowWidth, windowHeight);

    fft.setup(fftSize, fftSize / 2, fftSize / 4);
    kickEnvF.sampleRate = 60;
    auraEnvF.sampleRate = 60;
    hihatEnvF.sampleRate = 60;
    drumEnvF.sampleRate = 60;

    for (let i = 0; i < 300; i++) {

        flock.push(new Boid());

    };

};

function playLoop() {

    var sig = samplePlayer.play(1 / dur, 44100 * startSecs, 44100 * endSecs);

    //process wave
    fft.process(sig);
    this.output = sig;

}

function keyPressed() {

    if (key == '1') {
        audioContext.init();
        audioContext.loadSample("assets/Fantasy.mp3", samplePlayer);
        audioInit = true;
    }
}


function draw() {

    background(memphis);


    //==================================SEAWAVES===============

    var noi;
    var xScale = 9;

    for (var j = -windowHeight; j < windowHeight; j += step) {
        beginShape();
        fill(255, 0, 010, 10)
        for (var i = -step * xScale; i <= windowWidth + step * xScale * 2; i += step * xScale) {
            noi = noise(i * noiseScale + lightMean_3, j * noiseScale + lightMean_3 + frameCount / 1000.0) * strength;
            curveVertex(i, j + noi);
        }
        endShape();
    };

    //===============================

    
    model(object)
    
    object.background(100);
    object.noStroke();
    object.ellipse(object.width / 2, object.height / 2, 50, 50);
    image(object, 50, 50);
    image(object, 0, 0, 50, 50);


quadTree.clear();
for (const boid of flock) {
    quadTree.addItem(boid.position.x, boid.position.y, boid);
}

if (!audioInit) {
    push();
    fill(255);
    textAlign(CENTER);
    textSize(32);
    text("Press 1 key to start ...", width / 2, height / 2);
    pop();
    return;
}

noStroke();
fill(255);

text("startPosition: " + floor(startSecs / 60) + "mins " + floor(startSecs % 60), 20, 20);


total_0 = 0;
total_1 = 0;
total_2 = 0;
total_3 = 0;

for (var i = 0; i < numBins; i++) {


    var w = i * width / numBins;
    var bin = fft.getMagnitude(i);
    bin = constrain(bin / 50, 0, 1);



    var h = bin * height;
    line(w, height, w, height - h);

    //ADDING BINNING & COLOR COORDINATE BINS//

    //kick : red//
    if (i >= range_0[0] && i <= range_0[1]) {

        total_0 += bin;
        stroke(255, 0, 0);


    }

    //aura : pink// 
    else if (i >= range_1[0] && i <= range_1[1]) {

        total_1 += bin;
        stroke(255, 0, 255);



    }

    //hi-hat : green//
    else if (i >= range_2[0] && i <= range_2[1]) {

        total_2 += bin;
        stroke(0, 255, 0);


    }

    //drum : blue//
    else if (i >= range_3[0] && i <= range_3[1]) {
        //          
        total_3 += bin;
        stroke(0, 0, 255);



        //console.log(total_1);
    } else {
        stroke(255);
    };

};

//WORKING OUT AVERAGE//

//redlight//
lightMean_0 = total_0 / range_0.length;

//pinklight//
lightMean_1 = total_1 / range_1.length;
//greenlight//  
lightMean_2 = total_2 / range_2.length;
//bluelight//    
lightMean_3 = total_3 / range_3.length;

//console.log(total_0, total_1);
//lightMean_0 =  (lightMean_0/5, 0, 5);


//ANALYSE ENV & SMOOTHING//
//smoothing redlight//
lightMean_0 = kickEnvF.analyse(lightMean_0, 0.1, 0.2);
//smoothing pinklight// 
lightMean_1 = auraEnvF.analyse(lightMean_1, 0.1, 1.1);
//smoothing greenlight//
lightMean_2 = hihatEnvF.analyse(lightMean_2, 0.1, 0.1);
//smoothing bluelight//
lightMean_3 = drumEnvF.analyse(lightMean_3, 0.1, 0.2);


//mapping values for boid behaviours//
lightMean_0 = map(lightMean_0, 0.001, 1, 0, 10);
lightMean_1 = map(lightMean_1, 0.001, 1, 0.5, 2);
lightMean_2 = map(lightMean_2, 0.001, 1, 0, 10);
lightMean_3 = map(lightMean_3, 0.001, 1, 0.1, 3);



for (let boid of flock) {
    boid.edges();
    boid.flock(flock);
    boid.update();
    boid.show();

}

}


