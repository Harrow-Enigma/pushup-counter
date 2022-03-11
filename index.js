const canvas = utils.createElement("canvas", {
  id: "canvas",
});
const ctx = canvas.getContext("2d");
const video = document.getElementById("videoElement");

const getPose = async () => {
  const detector = await poseDetection.createDetector(
    poseDetection.SupportedModels.MoveNet
  );
  const poses = await detector.estimatePoses(video);

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const drawPoint = (y, x, r, name) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fillStyle = "#ff0000";
    ctx.fill();

    ctx.font = "7px Arial";
    ctx.fillText(name, x + 7, y + 2);
  };

  function drawSegment(pair1, pair2, color, scale) {
    ctx.beginPath();
    ctx.moveTo(pair1.x * scale, pair1.y * scale);
    ctx.lineTo(pair2.x * scale, pair2.y * scale);
    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    ctx.stroke();
  }

  function drawKeypoints(keypoints) {
    for (let i = 0; i < keypoints.length; i++) {
      const keypoint = keypoints[i];
      const { y, x } = keypoint;
      drawPoint(y, x, 5, keypoint.name);
    }
  }
  // if (!poses.length === 0)

  if (!(poses.length == 0)) {
    drawKeypoints(poses[0].keypoints);
  }
};

navigator.mediaDevices
  .getUserMedia({ video: true, audio: false })
  .then(function (stream) {
    window.stream = stream;
    video.srcObject = stream;

    video.addEventListener("loadeddata", (event) => {
      document.querySelector(".container").appendChild(canvas);
      setInterval(getPose, 1000);
    });
  })
  .catch(function (error) {
    console.log("Camera blocked");
  });
