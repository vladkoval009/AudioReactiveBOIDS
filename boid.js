class Boid {
    constructor() {
        // boid initialised essentials to create particle system//
        this.position = createVector(random(width), random(height));
        this.velocity = p5.Vector.random2D();
        //giving each boid a random velocity//
        //.setMag sets length of vector//
        this.velocity.setMag(random(2, 4));
        this.acceleration = createVector();
        //steering limit//

        this.maxForce = 2;
        this.maxF2 = 0.5;
        this.maxSpeed = 10;
        this.maxS = lightMean_1;


        //CREATIVE GEN DRAWING ASPECT//
        this.colorchanger = 100
        this.colorchanger2 = 100;
        this.scaler = 5;
        this.r = 3;

    }

    edges() {
        if (this.position.x > width) {
            this.position.x = 0;
            this.colorchanger += 50;

        } else if (this.position.x < 0) {
            this.position.x = width;
            this.colorchanger -= 50;

        }
        if (this.position.y > height) {
            this.position.y = 0;
        } else if (this.position.y < 0) {
            this.position.y = height;

        }
    }

    align(boids) {

        //steering is initially the average velocity of all boids - so we work out the average as var steering//
        //we give a percetion, an initialise total//
        let perceptionRadius = 100 * lightMean_3;
        let perceptionCount = 20;
        let steering = createVector();
        let total = 0;

        for (const other of quadTree.getItemsInRadius(this.position.x, this.position.y, perceptionRadius, perceptionCount)) {
            steering.add(other.velocity);
            total++;

        }
        if (total > 0) {
            //dividing total velocities: steering/ by total num of boids in percetion// 
            steering.div(total);
            //setting the length of steering vector to maxSpeed//
            steering.setMag(this.maxS);
            //subtract initial velocity to make new corrected direction vector 
            steering.sub(this.velocity);
            //limits the magnitude(length of vector) to the maxForce//
            steering.limit(this.maxF2);
        }
        //always return steering, even if nothing in perception, 0 will be returned. so this is done outside the if statement//
        return steering;

    }

    cohesion(boids) {
        //keeping these as is//
        let perceptionRadius = 100 * lightMean_3;
        let perceptionCount = 50;
        let steering = createVector();
        let total = 0;
        this.colorchanger = 100;
        for (const other of quadTree.getItemsInRadius(this.position.x, this.position.y, perceptionRadius, perceptionCount)) {
            steering.add(other.position);
            total++;
            this.colorchanger++;

        }
        if (total > 0) {

            steering.div(total);
            //subtracting own positin from steering 
            steering.sub(this.position);
            steering.setMag(this.maxSpeed);
            //subtract initial velocity to make new corrected direction vector 
            steering.sub(this.velocity);
            //limits the magnitude(length of vector) to the maxForce//
            steering.limit(this.maxF2);
        }
        //always return steering, even if nothing in perception, 0 will be returned. so this is done outside the if statement//
        return steering;

    }

    separation(boids) {
        //keeping these as is//
        let perceptionRadius = 50 * lightMean_3;
        let perceptionCount = 100;
        let steering = createVector();
        let total = 0;
        this.colorchanger2 = 0;

        for (const other of quadTree.getItemsInRadius(this.position.x, this.position.y, perceptionRadius, perceptionCount)) {
            const diff = p5.Vector.sub(this.position, other.position);
            const d = diff.mag();
            if (d === 0) continue;
            diff.div(d * d);
            steering.add(diff);
            total++;
            this.colorchanger2 += 100;


        }
        //     else { 
        //         this.colorchanger2--;
        //     }

        //CREATIVE ASPECT : change color according to distance//
        //            if(d > 100){
        ////                this.colorchanger -=100;
        //                  this.colorchanger2--;
        //            }



        if (total > 0) {


            steering.div(total);

            steering.setMag(this.maxSpeed);
            //subtract initial velocity to make new corrected direction vector // this makes steering change velocity of particle.
            steering.sub(this.velocity);

            //limits the magnitude(length of vector) to the maxForce//
            steering.limit(this.maxForce);

        }

        //always return steering, even if nothing in perception, 0 will be returned. so this is done outside the if statement//
        return steering;


    }

    flock(boids) {

        //accel.set(0,0) to insure acceleration doesnt accumulate over time. done at the begginging to initialise//can also simply mult(0);
        this.acceleration.set(0, 0);
        //alignment is using steering vector// the equasion and what is returned, the final outcome of this.align(boids);//
        let alignment = this.align(boids);
        let cohesion = this.cohesion(boids);
        let separation = this.separation(boids);


        //sliders pushing in values 
        separation.mult(lightMean_2);
        alignment.mult(lightMean_1);
        cohesion.mult(lightMean_1);


        //making acceleration = to aligment only because mass is always 1 in this world. force = mass*accel. accel = force/mass. if mass is 1,  accel = force(being allignment) thanks newton//
        this.acceleration.add(separation);
        this.acceleration.add(alignment);
        this.acceleration.add(cohesion);




    }

    //this update function adds velocity to position 
    update() {
        this.position.add(this.velocity);
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxSpeed);

    }


    show() {

       
        let noiseScale = 5;
        let noiseDetails = noise(this.position.x * noiseScale, this.position.y * noiseScale);

        stroke(noiseDetails * this.colorchanger);
        //        stroke(this.colorchanger2, 0, 50 - this.colorchanger2, 100);
        fill(this.colorchanger2 * noiseDetails, this.colorchanger2 * noiseDetails, this.colorchanger2 * noiseDetails, 100);
        square(this.position.x , this.position.y, 20, 20)


        //        var elements = 100;
        //        
        //        for (var i = 0; i < elements.length; i++) {
        //            ellipse(this.position.x, this.position.y, 10+lightMean_3[i],10+lightMean_0[i]);
        //        }
    }






    //        //  stroke(200);
    //        push();
    //        translate(this.position.x, this.position.y);
    //        rotate(theta);
    //        scale(lightMean_1 * 1.5);
    //        beginShape();
    //        //           
    //        vertex(0, -6);
    //        vertex(-1, 1);
    //        //        
    //        vertex(-6, 6);
    //        vertex(0, 3);
    //        vertex(7.5, 5.5);
    //        vertex(1, 1);
    //
    //        endShape(CLOSE);
    //        pop();

    //        image(img, this.r *20,this.r *30, this.r *30, this.r *30);

}
