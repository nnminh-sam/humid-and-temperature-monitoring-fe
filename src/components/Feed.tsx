// Feed.tsx
import React, { useEffect, useState } from "react";
import { List, Typography, Spin, Pagination } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Feed.css";

interface Channel {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
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
  });
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [totalFeeds, setTotalFeeds] = useState<number>(0);
  const navigate = useNavigate();
  const apiHost = import.meta.env.VITE_API_HOST;

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

        const response = await axios.get(
          `${apiHost}/api/v1/feeds?channelId=${channelId}&page=${currentPage}&size=${pageSize}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Sort feeds by createdAt in descending order
        const sortedFeeds = response.data.data.sort((a: Feed, b: Feed) => {
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });

        setFeeds(sortedFeeds);
        setTotalFeeds(response.data.metadata.pagination.totalDocuments);
      } catch (error) {
        console.error("Error fetching feeds:", error);
        navigate("/sign-in");
      } finally {
        setLoading(false);
      }
    };

    fetchFeeds();
  }, [apiHost, channelId, currentPage, navigate, pageSize]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return <Spin tip="Loading feed data..." />;
  }

  return (
    <div className="feed-container">
      <Typography.Title level={3}>Channel: {channel.name}</Typography.Title>
      <div className="feed-header">
        <div className="feed-cell">Temperature</div>
        <div className="feed-cell">Humidity</div>
        <div className="feed-cell">Temperature Threshold</div>
        <div className="feed-cell">Humidity Threshold</div>
        <div className="feed-cell">Created At</div>
      </div>
      <List
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
      <Pagination
        current={currentPage}
        pageSize={pageSize}
        onChange={handlePageChange}
        total={totalFeeds}
        style={{ marginTop: "20px", textAlign: "center" }}
      />
    </div>
  );
};

export default Feed;
