

let cameraController = new CameraController();

var camera, scene, renderer, controls;

var objects = [];

var raycaster;

var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var canJump = false;

var prevTime = performance.now();
var velocity = new THREE.Vector3();
var direction = new THREE.Vector3();
var vertex = new THREE.Vector3();
var color = new THREE.Color();


var grassColors = [
    '#9E9A41',
    '#758918',
    '#CFB590',
    '#627723',
    '#B0D236',
    '#CEFA61'
];
function getGrassColor(){
    return grassColors[Math.floor(Math.random()*grassColors.length)]
}

init();
animate();

function init() {

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, .1, 100);
    cameraController.addCamera(camera, 'First Person')

    camera2 = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, .1, 100);
    camera2.zoomDistance = 2;
    camera2.updateZoom = (zoom) => {
        if (zoom > 0){
            cameraController.setCurrentCamera(1)
        }

        camera2.zoomDistance+=zoom;
        if (camera2.zoomDistance < 1){
            camera2.zoomDistance = 1;
            cameraController.setCurrentCamera(0)
        }
    }
    cameraController.addCamera(camera2, 'Third Person');

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    scene.fog = new THREE.Fog(0xffffff, 0, 750);

    var light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 0.75);
    light.position.set(0.5, 1, 0.75);
    scene.add(light);
    var dir = new THREE.Vector3( 1, 0, 0 );

    //normalize the direction vector (convert to vector of length 1)
    dir.normalize();
    
    var origin = new THREE.Vector3( 0, 0, 0 );
    var length = .25;
    var hex = 0xffff00;
    
    arrowHelper = new THREE.ArrowHelper( dir, origin, length, hex );
    controls = new THREE.PointerLockControls(camera, document.body);

    var blocker = document.getElementById('blocker');
    var instructions = document.getElementById('instructions');

    instructions.addEventListener('click', function () {

        controls.lock();

    }, false);

    controls.addEventListener('lock', function () {

        instructions.style.display = 'none';
        blocker.style.display = 'none';

    });

    controls.addEventListener('unlock', function () {

        blocker.style.display = 'block';
        instructions.style.display = '';

    });

    scene.add(controls.getObject());

    var onKeyDown = function (event) {

        switch (event.keyCode) {

            case 38: // up
            case 87: // w
                moveForward = true;
                break;

            case 37: // left
            case 65: // a
                moveLeft = true;
                break;

            case 40: // down
            case 83: // s
                moveBackward = true;
                break;

            case 39: // right
            case 68: // d
                moveRight = true;
                break;

            case 32: // space
                if (canJump === true) velocity.y += 35.0;
                canJump = false;
                break;

        }

    };

    var onKeyUp = function (event) {

        switch (event.keyCode) {

            case 38: // up
            case 87: // w
                moveForward = false;
                break;

            case 37: // left
            case 65: // a
                moveLeft = false;
                break;

            case 40: // down
            case 83: // s
                moveBackward = false;
                break;

            case 39: // right
            case 68: // d
                moveRight = false;
                break;

            case 67: // d
                cameraController.cycleCameras()
                break;

        }

    };

    document.addEventListener('keydown', onKeyDown, false);
    document.addEventListener('keyup', onKeyUp, false);

    raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, - 1, 0), 0, 10);

    // floor

    var square_size = 25;
    var size = square_size * square_size;
    var division = square_size;

    var geometry = new THREE.BoxGeometry(1, 1, 1);
    let yIndex = 0;

    for (let xIndex = 0; xIndex < size; xIndex++) {

        var randomColor = "000000".replace(/0/g, function () { return (~~(Math.random() * 16)).toString(16); });
        var material = new THREE.MeshBasicMaterial({ color: getGrassColor()});
        var cube = new THREE.Mesh(geometry, material);
        cube.position.set(1 * xIndex - (yIndex * division), -0.5, 1 * yIndex);
        if ((xIndex + 1) / division == Math.floor((xIndex + 1) / division)) {
            yIndex++;
        }
        scene.add(cube);
    }

    var playergeometry = new THREE.BoxGeometry(1, 2, 1);

    var material = new THREE.MeshBasicMaterial({ color: 'white', wireframe:true });
    player = new THREE.Mesh(playergeometry, material);
    scene.add(player);
    player.position.y=1;

    //
    var geometry = new THREE.SphereGeometry( .25, 32, 32 );
    var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
     sphere = new THREE.Mesh( geometry, material );
    scene.add( sphere );
    sphere.position.set(2, .5, 2)

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    //

    window.addEventListener('resize', onWindowResize, false);

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

function animate() {

    requestAnimationFrame(animate);

    if (controls.isLocked === true) {

        raycaster.ray.origin.copy(controls.getObject().position);
        raycaster.ray.origin.y -= 10;

        var intersections = raycaster.intersectObjects(objects);

        var onObject = intersections.length > 0;

        var time = performance.now();
        var delta = (time - prevTime) / 1000;
        var angleRadians = Math.atan2(camera.getWorldDirection(new THREE.Vector3()).z - 0, camera.getWorldDirection(new THREE.Vector3()).x - 0);

        if (moveForward || moveBackward) {    
            player.rotation.y = -angleRadians;
            camera.position.x+= Math.cos(angleRadians)*delta*2;
            camera.position.z+= Math.sin(angleRadians)*delta*2;
        }

        if (onObject === true) {

            velocity.y = Math.max(0, velocity.y);
            canJump = true;

        }


        controls.getObject().position.y += (velocity.y * delta); // new behavior

        if (controls.getObject().position.y < 1) {

            velocity.y = 0;
            controls.getObject().position.y = 1;

            canJump = true;

        }

        prevTime = time;

    }
    
    // angle in radians
    
    player.position.set(camera.position.x, camera.position.y, camera.position.z)
    var raycaster2 = new THREE.Raycaster(camera.getWorldPosition(new THREE.Vector3()), camera.getWorldDirection(new THREE.Vector3()), .1, 1.5);
    raycaster2.set(camera.getWorldPosition(new THREE.Vector3()), camera.getWorldDirection(new THREE.Vector3()))
    
    // calculate objects intersecting the picking ray
    var intersects = raycaster2.intersectObjects( [sphere] );
    arrowHelper.children[1].material.color.set( 0x000000 );

    arrowHelper.scale.x = 1;
    arrowHelper.scale.z = 1;
    for ( var i = 0; i < intersects.length; i++ ) {

        arrowHelper.children[1].material.color.set( 0xff0000 );
        arrowHelper.scale.x = 2;
        arrowHelper.scale.z = 2;

    }


    camera2.setRotationFromQuaternion(camera.getWorldQuaternion(new THREE.Quaternion()))
    camera2.position.set(
        camera.position.x - (camera2.zoomDistance*Math.cos(angleRadians)),
        camera.position.y + (camera2.zoomDistance)*1.5,
        camera.position.z - (camera2.zoomDistance*Math.sin(angleRadians))
    )

    arrowHelper.position.copy(cameraController.getCurrentCamera().getWorldPosition(new THREE.Vector3()));
    arrowHelper.setDirection(cameraController.getCurrentCamera().getWorldDirection(new THREE.Vector3()))

    renderer.render(scene, cameraController.getCurrentCamera());

}
