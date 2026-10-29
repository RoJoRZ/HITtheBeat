// Test-only recording on the render thread: short clicks cannot fall between JS timer samples.
class TestCapture extends AudioWorkletProcessor {
  chunks = [];
  recording = false;
  constructor() {
    super();
    this.port.onmessage = ({data}) => {
      if (data === 'start') { this.chunks = []; this.recording = true; this.port.postMessage({started:true}); }
      if (data === 'flush') {
        this.recording = false;
        this.port.postMessage({chunks:this.chunks},this.chunks.map(chunk=>chunk.data.buffer));
        this.chunks = [];
      }
    };
  }
  process(inputs, outputs) {
    if(this.recording && inputs[0]?.[0] && this.chunks.length < 6000) this.chunks.push({at:currentTime,data:inputs[0][0].slice()});
    for(const channel of outputs[0]??[])channel.fill(0);
    return true;
  }
}
registerProcessor('test-capture',TestCapture);
