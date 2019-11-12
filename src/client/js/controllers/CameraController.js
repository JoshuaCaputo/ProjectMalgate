/**
 * @author joshuacaputo
 */

CameraController = function ( ) {

	//
	// internals
	//

    var scope = this;
    
    this.cameras = [];
    this.current = 0;

    this.addCamera = (camera, name) => {
        camera.name = name;
        scope.cameras.push(camera);
    };
    
    this.getCurrentCamera = () => {
        return scope.cameras[scope.current];
    };

    this.setCurrentCamera = (index) => {
        scope.current = index;
    };


    this.cycleCameras = () => {
        scope.current++;
        if (scope.current > scope.cameras.length-1){
            scope.current = 0;
        }
    };

};

CameraController.prototype.constructor = CameraController;
