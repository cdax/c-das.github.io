//constants denoting edge-behaviours 
var Constants = {
    WRAP        : 'wrap',
    BOUNCE      : 'bounce',
    AVOID       : 'avoid',
    MAXSPEED    : 1.5, 
    MAXSTEER    : 0.1,
    MINMASS     : .5,
    MAXMASS     : 2,
    ARRIVALTHRESHOLD: 50,
    WANDERDISTANCE  : 30,
    WANDERRADIUS: 10,
    WANDERRANGE : 30,
    TOOCLOSEDISTANCE: 20,
    INSIGHTDISTANCE: 60,
    AVOIDDISTANCE: 200,
    AVOIDBUFFER: 0,
    BOUNCEBUFFER: -20,
    MINDISTANCEFROMMOUSE: 200
};

//Set x- and y-axis bounds to screen coordinates
//top-left corner
var sx0 = view.bounds.point.x, sy0 = view.bounds.point.y;
//bottom-right corner
var sx = view.bounds.width, sy = view.bounds.height;

//Set z-axis bound
var sz = 50;

//The Boid class
var Boid = function(sprite) {
    
    this.x = sx0 + Constants.BOUNCEBUFFER / 2 + Constants.BOUNCEBUFFER * Math.random() / 2;
    this.y = sy0 + Constants.BOUNCEBUFFER / 2 + Constants.BOUNCEBUFFER * Math.random() / 2;
    this.z = Math.random() * sz;
    
    this.mass = Constants.MINMASS + Math.random() * (Constants.MAXMASS - Constants.MINMASS);
    
    this.sprite = sprite;
    this.sprite.position.x = this.x;
    this.sprite.position.y = this.y;
    this.sprite.scaling = this.mass;
    
    this.position = this.sprite.position;
    //this.position.angle = 0;
    this.rotation = 0;
    this.wanderAngle = 0;
    this.velocity = new paper.Point(0, 0);
    this.steer = new paper.Point(0, 0);
    
    this.edgeBehaviour = Constants.BOUNCE;
    
    /*this.__defineSetter__('position', function(newPosition) {
        this.position = newPosition;
        this.shape.position = newPosition;
    });
    this.__defineGetter__('position', function() {
        return this.position;
    });*/
    
    this.handleBounce = function() {
        
        //console.log(this.position, this.velocity);
        
        if(this.position.x > sx - Constants.BOUNCEBUFFER) {
            this.position.x = sx - Constants.BOUNCEBUFFER;
            this.velocity.x *= -1;
            //console.log(this.velocity.angle);
        }
        else if(this.position.x < 0 + Constants.BOUNCEBUFFER) {
            this.position.x = 0 + Constants.BOUNCEBUFFER;
            this.velocity.x *= -1;
            //console.log(this.velocity.angle);
        }
        
        if(this.position.y > sy - Constants.BOUNCEBUFFER) {
            this.position.y = sy - Constants.BOUNCEBUFFER;
            this.velocity.y *= -1;
            //console.log(this.velocity.angle);
        }
        else if(this.position.y < 0 + Constants.BOUNCEBUFFER) {
            this.position.y = 0 + Constants.BOUNCEBUFFER;
            this.velocity.y *= -1;
            //console.log(this.velocity.angle);
        }
    };
    
    this.handleWrap = function() {
        
        if(this.position.x > sx) {
            this.position.x = 0;
        }
        else if(this.position.x < 0) {
            this.position.x = sx;
        }
        
        if(this.position.y > sy) {
            this.position.y = 0;
        }
        else if(this.position.y < 0) {
            this.position.y = sy;
        }
    };
    
    this.getClosestPointOnBox = function(box) {
        //console.log(JSON.stringify(box));
        var sx0 = box.point.x, sy0 = box.point.y;
        var sx = box.point.x + box.width, sy = box.point.y + box.height;
        var closestX = Math.min(
            this.position.x - sx0,
            sx - this.position.x
        );
        var closestY = Math.min(
            this.position.y - sy0,
            sy - this.position.y
        );
        if(closestX < closestY) {
            return new paper.Point(closestX == (this.position.x - sx0) ? sx0 : sx, this.position.y);
        }
        else {
            return new paper.Point(this.position.x, closestY == (this.position.y - sy0) ? sy0 : sy);
        }
    };
    
    this.boundingBox = new paper.Rectangle({
        point: new paper.Point(sx0 + Constants.AVOIDBUFFER, sy0 + Constants.AVOIDBUFFER),
        size: new paper.Size(sx - 2 * Constants.AVOIDBUFFER, sy - 2 * Constants.AVOIDBUFFER)//,
        //strokeColor: 'yellow'
    });
    
    this.innerBoundingBox = new paper.Rectangle({
        point: new paper.Point(sx0 + Constants.AVOIDBUFFER + Constants.MAXSPEED, sy0 + Constants.AVOIDBUFFER + Constants.MAXSPEED),
        size: new paper.Size(sx - 2 * Constants.AVOIDBUFFER - 2 * Constants.MAXSPEED, sy - 2 * Constants.AVOIDBUFFER - 2 * Constants.MAXSPEED)//,
        //strokeColor: 'yellow'
    });
    
    this.handleAvoid = function() {
        
        //console.log(1);
        
        var heading = this.velocity.clone().normalize();
        
        var difference = this.getClosestPointOnBox(this.boundingBox) - this.position;
        var dotProd = difference.x * heading.x + difference.y * heading.y;
        
        //console.log(this.getClosestPointOnBox(view.bounds), this.position, difference, this.velocity, heading);        
        this.marker.position = this.getClosestPointOnBox(this.boundingBox);
        //this.marker.fillColor = 'blue';
        
        
        if(dotProd > 0) {
            
            //console.log(dotProd);
            
            var feeler = heading * Constants.AVOIDDISTANCE + this.position;
            var projection = heading * dotProd;
            
            
        
            if((!feeler.isInside(view.bounds)) && projection.length < feeler.length) {
                //console.log(projection.length, feeler.length);
                //console.log("about to hit!");
                this.sprite.fillColor = 'red';
                var force = heading * Constants.MAXSPEED;
                force.angle = force.angle + (((-difference.y * this.velocity.x + difference.x * this.velocity.y) <= 0) ? -1 : 1) * 90;
                force = force * (1.0 - projection.length / feeler.length);
                this.steer = this.steer + force;
                console.log(this.steer);
                this.velocity = this.velocity * (projection.length / feeler.length);
            } else {
                this.handleBounce();
            }
        } else {
            this.handleBounce();
        }
        
        //this.handleWrap();
    };
    
    this.seek = function(target) {
        //console.log('target', target);
        var desiredVelocity = target - this.position;
        //console.log('desiredVelocity', desiredVelocity);
        desiredVelocity = desiredVelocity.normalize() * Constants.MAXSPEED;
        var force = desiredVelocity - this.velocity;
        //console.log('force', force);
        this.steer = this.steer + force;
        //console.log('steer', this.steer);
    };
    
    this.flee = function(target) {
        //console.log('target', target);
        var desiredVelocity = target - this.position;
        //console.log('desiredVelocity', desiredVelocity);
        desiredVelocity = desiredVelocity.normalize() * Constants.MAXSPEED;
        var force = desiredVelocity - this.velocity;
        //console.log('force', force);
        this.steer = this.steer - force;
        //console.log('steer', this.steer);
    };
    
    this.arrive = function(target) {
        //console.log('target', target);
        var desiredVelocity = target - this.position;
        //console.log('desiredVelocity', desiredVelocity);
        desiredVelocity = desiredVelocity.normalize();
        var dist = this.position.getDistance(target);
        if(dist > Constants.ARRIVALTHRESHOLD) {
            desiredVelocity = desiredVelocity * Constants.MAXSPEED;
        }
        else {
            desiredVelocity = desiredVelocity * Constants.MAXSPEED * dist / Constants.ARRIVALTHRESHOLD;
        }
        var force = desiredVelocity - this.velocity;
        //console.log('force', force);
        this.steer = this.steer + force;
        //console.log('steer', this.steer);
    };
    
    this.pursue = function(target) {
        
        //console.log("enter pursue")
        var dist = this.position.getDistance(target);
        var lookAhead = dist / Constants.MAXSPEED;
        var predictedTarget = target.position + target.velocity * lookAhead;
        this.arrive(predictedTarget);
    };
    
    this.evade = function(target) {
        
        var dist = this.position.getDistance(target);
        var lookAhead = dist / Constants.MAXSPEED;
        var predictedTarget = target.position + target.velocity * lookAhead;
        this.flee(predictedTarget);
    };
    
    this.wander = function() {
        
        //console.log("enter wander");
        var center = this.velocity.normalize() * Constants.WANDERDISTANCE;
        var offset = new paper.Point(center);
        offset.length = Constants.WANDERRADIUS;
        offset.angle = this.wanderAngle;
        this.wanderAngle += Math.random() * Constants.WANDERRANGE - Constants.WANDERRANGE / 2;
        
        var force = center + offset;
        this.steer = this.steer + force;
    };
    
    this.isTooCloseTo = function(boid) {
        
        return (this.position.getDistance(boid.position) <= Constants.TOOCLOSEDISTANCE);
    };
    
    this.isInSightOf = function(boid) {
        
        if(this.position.getDistance(boid.position) > Constants.INSIGHTDISTANCE)
            return false;
        
        //Check if target boid is behind this boid. 
        //If yes, then don't follow.
        var heading = new paper.Point(this.velocity);
        heading = heading.normalize();
        var diff = boid.position - this.position;
        var dotProduct = diff.x * heading.x + diff.y * heading.y;
        if(dotProduct < 0) return false;
        
        return true;
        
        };
    
    this.flock = function(boids) {
        
        var avgVelocity = new paper.Point(this.velocity);
        var avgPosition = new paper.Point(0, 0);
        
        var boidsInSight = 0;
        
        for(var i = 0; i < boids.length; ++i) {
            
            var boid = boids[i];
            if(boid != this && boid.isInSightOf(this)) {
                avgVelocity = avgVelocity + boid.velocity;
                avgPosition = avgPosition + boid.position;
                if(boid.isTooCloseTo(this))
                    this.flee(boid.position);
                boidsInSight++;
            }
        }
        if(boidsInSight > 0) {
            avgVelocity = avgVelocity / boidsInSight;
            avgPosition = avgPosition / boidsInSight;
            this.seek(avgPosition);
            this.steer = this.steer + avgVelocity - this.velocity;
        }
    };
    
    this.update = function() {
        
        
        
        //if(this.position.isInside(this.innerBoundingBox)) {
        //steer should not exceed the maximum
        this.steer.length = Math.min(this.steer.length, Constants.MAXSTEER);
        this.steer = this.steer / this.mass;
        //console.log(this.velocity);
        this.velocity = this.velocity + this.steer;
        
        //velocity should not exceed the maximum
        this.velocity.length = Math.min(this.velocity.length, Constants.MAXSPEED);
        
        //update position and rotation
        this.position = this.position + this.velocity;
        
        
        //handle edge-behaviours
        switch(this.edgeBehaviour) {
            case Constants.WRAP:
                this.handleWrap();
                break;
            case Constants.BOUNCE:
                this.handleBounce();
                break;
            case Constants.AVOID:
                this.handleAvoid();
                break;
        }
        
        //update sprite position
        this.sprite.position = this.position;
        
        //update sprite rotation
        if(this.rotation != this.velocity.angle) {
            
            this.sprite.rotation = this.velocity.angle - this.rotation;
            this.rotation = this.velocity.angle;
        }
       // }
        
        delete this.steer;
        this.steer = new paper.Point(0, 0);
    };
    
    console.log('Boid created at (' + this.x + ', ' + this.y + ')');
}

var testBoids = [];
var numTestBoids = 30;

for(var i = 0; i < numTestBoids; ++i) {
    testBoids.push(new Boid(new paper.Path({
        segments: [new paper.Point(5, 0), new paper.Point(-5, -3), new paper.Point(-3, 0), new paper.Point(-5, 3)],
        closed: true,
        strokeColor: 'black',
        fillColor: '#1485CC'
    })));
    testBoids[i].sprite.fillColor.alpha = 0.3;
    testBoids[i].velocity.length = 1;
    testBoids[i].velocity.angle = 30;
}

var mt = new paper.Point(0, 0);
var mfollow = true;
var k = 0;

function onFrame(event) {
    for(var i = 0; i < numTestBoids; ++i) {
        if(i == k/numTestBoids)
            testBoids[i].arrive(mt);
        /*if(i == 0)
            testBoids[i].wander();*/
        /*else
            testBoids[i].pursue(testBoids[0]);
        for(var j = 1; j < i; ++j) {
            if(testBoids[j].position.getDistance(testBoids[i].position) <10) {
                
                testBoids[j].evade(testBoids[i]);
            }
        }*/
        testBoids[i].flock(testBoids);
        //if(mfollow) testBoids[i].arrive(mt);
        if(testBoids[i].position.getDistance(mt) < Constants.MINDISTANCEFROMMOUSE)
            testBoids[i].flee(mt);
        //testBoids[i].sprite.fillColor.hue = (testBoids[i].sprite.fillColor.hue + 0.2) % 360;
        //console.log(testBoids[i].sprite.fillColor.hue)
        testBoids[i].update();
    }
    k = (k + 1) % (numTestBoids * numTestBoids);
}

function onMouseMove(event) {
    mt = event.point;
}

function onMouseDown(event) {
    mfollow = false;
}

function onMouseUp(event) {
    mfollow = true;
}

function onResize(event) {
    sx0 = view.bounds.point.x;
    sy0 = view.bounds.point.y;
    sx = view.bounds.width;
    sy = view.bounds.height;
}