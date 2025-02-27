import asyncio
import datetime
import random
import websockets
import socket
import json

# a set to hold websocket connections
CONNECTIONS = set()

# create an array for each of the shake's sensors
rsData = {"EHZ": [], "ENZ": [], "ENN": [], "ENE": []}

# define the data structure that will be passed to the client
sendData = {"msgType": "static", "q": "q1", "EHZ": [], "ENZ": [], "ENN": [], "ENE": []}

# count messages sent to client
# used for sending a full data set when the top graph spills over
msgCount = 0

async def register(websocket):
    CONNECTIONS.add(websocket)
    
    # new connections get a full data set to start
    
    # static line 1
    sendData["EHZ"] = rsData["EHZ"][-36000:]
    sendData["ENZ"] = rsData["ENZ"][-36000:]
    sendData["ENN"] = rsData["ENN"][-36000:]
    sendData["ENE"] = rsData["ENE"][-36000:]
    sendData["q"] = "q1"
    qJson = json.dumps(sendData)
    await websocket.send(qJson)

    # static line 2
    sendData["EHZ"] = rsData["EHZ"][-72000:-36000]
    sendData["ENZ"] = rsData["ENZ"][-72000:-36000]
    sendData["ENN"] = rsData["ENN"][-72000:-36000]
    sendData["ENE"] = rsData["ENE"][-72000:-36000]
    sendData["q"] = "q2"
    qJson = json.dumps(sendData)
    await websocket.send(qJson)

    # static line 3
    sendData["EHZ"] = rsData["EHZ"][-108000:-72000]
    sendData["ENZ"] = rsData["ENZ"][-108000:-72000]
    sendData["ENN"] = rsData["ENN"][-108000:-72000]
    sendData["ENE"] = rsData["ENE"][-108000:-72000]
    sendData["q"] = "q3"
    qJson = json.dumps(sendData)
    await websocket.send(qJson)

    # static line 4
    sendData["EHZ"] = rsData["EHZ"][-144000:-108000]
    sendData["ENZ"] = rsData["ENZ"][-144000:-108000]
    sendData["ENN"] = rsData["ENN"][-144000:-108000]
    sendData["ENE"] = rsData["ENE"][-144000:-108000]
    sendData["q"] = "q4"
    qJson = json.dumps(sendData)
    await websocket.send(qJson)

    # top line 60 second live stream
    lastMinute = {"msgType": "lastMinute", "EHZ": rsData["EHZ"][-6000:], "ENZ": rsData["ENZ"][-6000:], "ENN": rsData["ENN"][-6000:], "ENE": rsData["ENE"][-6000:]}
    qJson = json.dumps(lastMinute)
    await websocket.send(qJson)
    
    try:
        await websocket.wait_closed()
    finally:
        CONNECTIONS.remove(websocket)

async def shake_data():
    global msgCount
    
    # listen to udp stream from the shake on port 8889
    sock_rec = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock_rec.bind(('', 8889))
    
    # begin main loop
    while True:
        data, addr = sock_rec.recvfrom(4096)
        
        # bit of scrub and parse
        data = data.decode('utf-8')
        data = data.replace('{','')
        data = data.replace('}','')
        data = data.replace("'","")
        pieces = data.split(',')
        
        # identify which of the four sensors was received
        sensorName = pieces[0]
        
        # create live stream 'tick' message
        sendValue = "{\"msgType\": \"tick\",\"sensor\": \""+sensorName+"\",\"values\": ["

        # we get one timestamp with 25 datapoints, 4 times per second
        # each data point is 10 ms apart
        tstamp = (float(pieces[1])*1000)-10

        # remove sensor name and timestamp, leaving only data values
        del pieces[0]
        del pieces[0]

        # fill sendData with data points
        # append rsData with data points
        # data is formatted for d3.js to understand
        # d3 needs a timestamp for every data point
        # could be done client side, done here to make it a bit easier on the browser
        for piece in pieces:
            tstamp +=10
            sendValue += "{\"time\": "+str(tstamp)+",\"value\": "+piece+"},"
            rsData[sensorName].append({"time":tstamp,"value":piece})
        sendValue = sendValue.strip(',')
        sendValue += "]}";

        # send the live stream data
        websockets.broadcast(CONNECTIONS, sendValue)
        
        # remove old rsData
        if len(rsData[sensorName]) >= 244000:
          rsData[sensorName]=rsData[sensorName][-144000:]
        
        # send the full data set every 60 seconds
        # 60 seconds * 4 sensors * 4 updates/sec = 960
        msgCount += 1
        if msgCount > 959:
            # each static line holds 6 minutes of data
            # 100 data points per sensor per second
            # 100 * 60 * 6 = 36000 data points for each line
            sendData["EHZ"] = rsData["EHZ"][-36000:]
            sendData["ENZ"] = rsData["ENZ"][-36000:]
            sendData["ENN"] = rsData["ENN"][-36000:]
            sendData["ENE"] = rsData["ENE"][-36000:]
            sendData["q"] = "q1"
            qJson = json.dumps(sendData)
            websockets.broadcast(CONNECTIONS, qJson)
            sendData["EHZ"] = rsData["EHZ"][-72000:-36000]
            sendData["ENZ"] = rsData["ENZ"][-72000:-36000]
            sendData["ENN"] = rsData["ENN"][-72000:-36000]
            sendData["ENE"] = rsData["ENE"][-72000:-36000]
            sendData["q"] = "q2"
            qJson = json.dumps(sendData)
            websockets.broadcast(CONNECTIONS, qJson)
            sendData["EHZ"] = rsData["EHZ"][-108000:-72000]
            sendData["ENZ"] = rsData["ENZ"][-108000:-72000]
            sendData["ENN"] = rsData["ENN"][-108000:-72000]
            sendData["ENE"] = rsData["ENE"][-108000:-72000]
            sendData["q"] = "q3"
            qJson = json.dumps(sendData)
            websockets.broadcast(CONNECTIONS, qJson)
            sendData["EHZ"] = rsData["EHZ"][-144000:-108000]
            sendData["ENZ"] = rsData["ENZ"][-144000:-108000]
            sendData["ENN"] = rsData["ENN"][-144000:-108000]
            sendData["ENE"] = rsData["ENE"][-144000:-108000]
            sendData["q"] = "q4"
            qJson = json.dumps(sendData)
            websockets.broadcast(CONNECTIONS, qJson)
            msgCount = 0
        await asyncio.sleep(0)

async def main():
    async with websockets.serve(register, "0.0.0.0", WEBSOCKETPORT):
        await shake_data()

if __name__ == "__main__":
    asyncio.run(main())
