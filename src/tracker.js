class Tracker {
  constructor() {
    this.doBeforeClosingWindow = this.doBeforeClosingWindow.bind(this);
    this.initEventListenersAndIntervals();
  }

  buffer = [];
  maxBufferSize = 3;
  whenLastTryToSendToServerTimestamp = 0;
  sendToServerOncePerMs = 1000;
  trackingApiUrl = "http://localhost:8001/track";
  intervalId = null;
  newEventId = 0;

  track(event, ...tags) {
    const eventData = this.createEventData(event, tags);

    this.addEventToBuffer(eventData);
    this.sendDataToServerIfNeeded();
  }

  createEventData(event, tags) {
    const title = document.title || "";
    const url = window.location.href;
    const now = new Date();
    const formattedTime = now.toISOString();
    const id = this.getIdForEvent();

    const eventData = {
      id,
      event,
      tags,
      url,
      title,
      ts: formattedTime,
    };

    return eventData;
  }

  getIdForEvent() {
    const isMaxId = this.newEventId >= Number.MAX_SAFE_INTEGER;

    let eventIdToUse;

    if (isMaxId) {
      eventIdToUse = 0;
    } else {
      eventIdToUse = this.newEventId + 1;
    }

    this.newEventId = eventIdToUse;

    return eventIdToUse;
  }

  addEventToBuffer(eventData) {
    this.buffer.push(eventData);
  }

  sendDataToServerIfNeeded() {
    const areThereEventsInBuffer = this.buffer.length > 0;

    if (!areThereEventsInBuffer) {
      return;
    }

    const isBufferFullyFilled = this.checkIfBufferFullyFilled();
    const isEnoughTimePassedFromLastSending =
      this.checkIfEnoughTimePassedFromLastSending();

    if (isEnoughTimePassedFromLastSending || isBufferFullyFilled) {
      this.sendDataToServerAndClearBuffer();
    }
  }

  checkIfBufferFullyFilled() {
    const itemsInBufferCount = this.buffer.length;
    const isBufferFullyFilled = itemsInBufferCount >= this.maxBufferSize;

    return isBufferFullyFilled;
  }

  checkIfEnoughTimePassedFromLastSending() {
    const now = new Date();
    const nowInMs = now.getTime();

    const passedFromLastSendingToServerMs =
      nowInMs - this.whenLastTryToSendToServerTimestamp;

    const isEnoughTimePassedFromLastSending =
      passedFromLastSendingToServerMs > this.sendToServerOncePerMs;

    return isEnoughTimePassedFromLastSending;
  }

  async sendDataToServerAndClearBuffer() {
    try {
      const now = new Date();
      const nowInMs = now.getTime();
      this.whenLastTryToSendToServerTimestamp = nowInMs;

      const eventsToSend = this.buffer;
      const eventsIdsToSend = eventsToSend.map((item) => item.id);

      const response = await fetch(this.trackingApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify({
          events: eventsToSend,
        }),
      });

      if (!response.ok || response.status !== 200) {
        console.log("Event not saved, some error occured");
      }

      this.clearBuffer(eventsIdsToSend);
    } catch (error) {
      console.log(error);
    }
  }

  clearBuffer(eventIdsToClear) {
    this.buffer = this.buffer.filter(
      (item) => !eventIdsToClear.includes(item.id)
    );
  }

  doBeforeClosingWindow() {
    if (this.buffer.length > 0) {
      this.sendDataToServerAndClearBuffer();
    }

    window.removeEventListener("beforeunload", this.doBeforeClosingWindow);
    clearInterval(this.intervalId);
  }

  initEventListenersAndIntervals() {
    window.addEventListener("beforeunload", this.doBeforeClosingWindow);

    this.intervalId = setInterval(() => {
      this.sendDataToServerIfNeeded();
    }, this.sendToServerOncePerMs);
  }
}

const tracker = new Tracker();
