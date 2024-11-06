// Feed.tsx
import React, { useEffect, useState } from "react";
import { List, Typography, Spin, Button } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { io, Socket } from "socket.io-client";
import "./Feed.css";

interface User {
  email: string;
  fullName: string;
}

interface Channel {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  writeKey: string;
  readKey: string;
  user: User;
}

interface Feed {
  id: string;
  temperature: number;
  humidity: number;
  temperatureThreshold: number;
  humidityThreshold: number;
  createdAt: string;
  updatedAt: string;
}

const Feed: React.FC = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const [channel, setChannel] = useState<Channel>({
    id: "",
    name: "",
    description: "",
    createdAt: "",
    updatedAt: "",
    writeKey: "",
    readKey: "",
    user: { email: "", fullName: "" },
  });
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const apiHost = import.meta.env.VITE_API_HOST;
  const socketUrl = import.meta.env.VITE_API_HOST;
  const socket: Socket = io(socketUrl);

  useEffect(() => {
    socket.emit("joinRoom", { channelId });
  }, [socketUrl, channelId]);

  socket.on("newFeed", (newFeed: Feed) => {
    console.log("New feed received:", newFeed);
    setFeeds((prevFeeds) => [newFeed, ...prevFeeds]);
  });

  useEffect(() => {
    const fetchFeeds = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          throw new Error("User is not authenticated");
        }

        const channelResponse = await axios.get(
          `${apiHost}/api/v1/channels/${channelId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setChannel(channelResponse.data.data);
        setKeys({
          writeKey: channelResponse.data.data.writeKey,
          readKey: channelResponse.data.data.readKey,
        });

        const response = await axios.get(
          `${apiHost}/api/v1/feeds?channelId=${channelId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setFeeds(response.data.data.reverse());
      } catch (error) {
        console.error("Error fetching feeds:", error);
        navigate("/sign-in");
      } finally {
        setLoading(false);
      }
    };

    fetchFeeds();
  }, [apiHost, channelId, navigate]);

  if (loading) {
    return <Spin tip="Loading feed data..." />;
  }

  const generateNewKeyHandler = async () => {
    try {
      const generateNewKeys = await axios.get(
        `${apiHost}/api/v1/channels/${channelId}/keys?email=${channel.user.email}`
      );
      setKeys({
        writeKey: generateNewKeys.data.data.writeKey,
        readKey: generateNewKeys.data.data.readKey,
      });
    } catch (error) {
      console.error("Error fetching feeds:", error);
      alert("Error generating new keys");
    }
  };

  return (
    <div className="feed-container">
      <div className="feed-header-fixed">
        <Typography.Title level={3}>Channel: {channel.name}</Typography.Title>
        <p>
          <strong>Write key:</strong> {keys.writeKey}
        </p>
        <p>
          <strong>Read key:</strong> {keys.readKey}
        </p>
        <Button onClick={generateNewKeyHandler}>Generate new keys</Button>
        <p></p>
        <div className="feed-header">
          <div className="feed-cell">Temperature</div>
          <div className="feed-cell">Humidity</div>
          <div className="feed-cell">Temperature Threshold</div>
          <div className="feed-cell">Humidity Threshold</div>
          <div className="feed-cell">Timestamp</div>
        </div>
      </div>
      <div className="list-container">
        <List
          className="feed-list"
          itemLayout="horizontal"
          dataSource={feeds}
          renderItem={(feed) => (
            <List.Item className="feed-row">
              <div className="feed-cell">{feed.temperature}</div>
              <div className="feed-cell">{feed.humidity}</div>
              <div className="feed-cell">{feed.temperatureThreshold}</div>
              <div className="feed-cell">{feed.humidityThreshold}</div>
              <div className="feed-cell">
                {new Date(feed.createdAt).toLocaleString()}
              </div>
            </List.Item>
          )}
        />
      </div>
    </div>
  );
};

export default Feed;
