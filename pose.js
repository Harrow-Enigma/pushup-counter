var flipHorizontal = false;
var video = document.querySelector("#videoElement");
var canvas = document.querySelector("#canvas");
var buff = document.querySelector("#buff");
var c = canvas.getContext('2d');
var num, increased, total, type, timer, check;

const line = [null, null, null, null, null, 6, 12, 5, 6, 7, 8, 5, 11, 11, 12, 13, 14];
//         = [0,    1,    2,    3,    4,    5, 6,  7, 8, 9, 10 11 12, 13, 14, 15, 16]
/*
    0	nose
    1	leftEye
    2	rightEye
    3	leftEar
    4	rightEar
    5	leftShoulder
    6	rightShoulder
    7	leftElbow
    8	rightElbow
    9	leftWrist
    10	rightWrist
    11	leftHip
    12	rightHip
    13	leftKnee
    14	rightKnee
    15	leftAnkle
    16	rightAnkle
*/

function begin(){
    num = 0;
    check=false;
    total = $('#num').val();
    type = $("#ex").val();
    if (type=='Push-up')   
        increased = false;
    else if (type=='Sit-up')
        increased = true;
    setTimeout(function(){$('#count').html('3');},1000);
    setTimeout(function(){$('#count').html('2');},2000);
    setTimeout(function(){$('#count').html('1');},3000);
    setTimeout(function(){beep(); $('#count').html('START'); check=true;},4000);
}

function pred_pose() {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    buff.width = video.videoWidth;
    buff.height = video.videoHeight;
    buff.getContext('2d').drawImage(video, 0, 0, buff.width, buff.height);
    posenet.load().then(function(net) {
        const model = net;
        model.estimateMultiplePoses(buff, {flipHorizontal: false}).then(function(multi_pose){
            var pose = multi_pose[get_nearest_pose(multi_pose)];
            var pos = pose['keypoints'];
            
            if (check && type=='Push-up'){
                var threshold = length(pos[5]['position'], pos[6]['position']) * 1.7;
                if (Math.abs(pos[7]['position']['x']-pos[8]['position']['x'])>threshold){
                    if (!increased) {
                        num += 1;
                        increased=true;
                        $('#count').html(num);
                        if (num==Number($('#num').val())){
                            $('#count').html('GOOD JOB!');
                            check=false;
                            console.log('completed');
                            ring();
                        } else{
                            beep();
                        }
                    }
                    
                } else if (Math.abs(pos[7]['position']['x']-pos[8]['position']['x'])<threshold*0.8){
                    increased=false;
                }
            }
            
            if (check && type=='Sit-up'){
                var threshold = length(pos[5]['position'], pos[11]['position']) * 0.25;
                if (length(pos[5]['position'], pos[15]['position'])<threshold){
                    if (!increased) {
                        num += 1;
                        increased=true;
                        $('#count').html(num);
                        if (num==Number($('#num').val())){
                            $('#count').html('GOOD JOB!');
                            check=false;
                            console.log('completed');
                            ring();
                        } else{
                            beep();
                        }
                    }
                    
                } else if (length(pos[5]['position'], pos[15]['position'])>threshold*4){
                    increased=false;
                }
            }
            
            draw(pose, c);
        });
    });
}

function slp2ang(slope){
    return Math.atan(slope);
}

function ang2slp(angle){
    return Math.tan(angle);
}

function deg2rad(deg){
    return deg*(Math.PI/180);
}

function rad2deg(rad){
    return rad*(180/Math.PI);
}

function length(p1, p2){
    return Math.sqrt(Math.pow((p1['x']-p2['x']),2)+Math.pow((p1['y']-p2['y']),2));
}

function reflect(num, axis, apply){
    if (apply)
        return axis-(num-axis);
    else
        return num;
}

function beep() {
    document.getElementById('beep').play();
}


function ring() {
    document.getElementById('ring').play();
}

function get_bounds(pose){
    ty=pose['keypoints'][0]['position']['y'];
    tx=pose['keypoints'][0]['position']['x'];
    by=pose['keypoints'][0]['position']['y'];
    bx=pose['keypoints'][0]['position']['x'];
    for (var i=1; i<17; i++){
        if (pose['keypoints'][i]['position']['x']<tx)
            tx=pose['keypoints'][i]['position']['x'];
        else if (pose['keypoints'][i]['position']['x']>bx)
            bx=pose['keypoints'][i]['position']['x'];
        if (pose['keypoints'][i]['position']['y']<ty)
            ty=pose['keypoints'][i]['position']['y'];
        else if (pose['keypoints'][i]['position']['y']>by)
            by=pose['keypoints'][i]['position']['y'];
    }
    return ([tx,ty,bx,by]);
}

function rect_area(coord_arr){
    return ((coord_arr[2]-coord_arr[0])*(coord_arr[3]-coord_arr[1]));
}

function get_nearest_pose(poses){
    var choice, step=0, record=0;
    for (var i in poses){
        var area=rect_area(get_bounds(poses[i]));
        if (area>record){
            record=area;
            choice=step;
        }
        step++;
    }
    return (choice);
}

function draw(pose, context){
    var c = context;
    var pos = pose['keypoints'];
    for (var i=0; i<17; i++){
                c.beginPath();
                c.strokeStyle='red';
                c.lineWidth=10;
                c.arc(reflect(pos[i]['position']['x'], video.videoWidth/2),pos[i]['position']['y'],5,0,2*Math.PI);
                c.stroke();
                
                if (line[i]!=null){
                    c.beginPath();
                    c.lineWidth=5;
                    c.strokeStyle='blue';
                    c.moveTo(reflect(pos[i]['position']['x'], video.videoWidth/2, false),pos[i]['position']['y']);
                    c.lineTo(reflect(pos[line[i]]['position']['x'], video.videoWidth/2, false),pos[line[i]]['position']['y']);
                    c.stroke();
                }
            }
    var bounds=get_bounds(pose);
    c.beginPath();
    c.strokeStyle='green';
    c.lineWidth=3;
    c.rect(bounds[0],bounds[1],bounds[2]-bounds[0],bounds[3]-bounds[1]);
    c.stroke();
}

navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    .then(function (stream) {
        window.stream=stream;
        video.srcObject = stream;
        var timer = setInterval(pred_pose, 100);
    })
    .catch(function (err0r) {
      console.log("Camera blocked");
    });