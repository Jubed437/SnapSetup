import React from 'react';
import './ActivityBar.css';

function ActivityBar({ activeView, setActiveView, leftSidebarCollapsed, setLeftSidebarCollapsed }) {
  const activities = [
    { id: 'explorer', icon: '📁', title: 'Explorer' },
    { id: 'search', icon: '🔍', title: 'Search' },
    { id: 'source-control', icon: '🌿', title: 'Source Control' },
    { id: 'extensions', icon: '🧩', title: 'Extensions' },
    { id: 'settings', icon: '⚙️', title: 'Settings' }
  ];

  const handleActivityClick = (activityId) => {
    if (activeView === activityId && !leftSidebarCollapsed) {
      setLeftSidebarCollapsed(true);
    } else {
      setActiveView(activityId);
      setLeftSidebarCollapsed(false);
    }
  };

  return (
    <div className="activity-bar">
      <div className="activity-items">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className={`activity-item ${activeView === activity.id ? 'active' : ''}`}
            onClick={() => handleActivityClick(activity.id)}
            title={activity.title}
          >
            <span className="activity-icon">{activity.icon}</span>
          </div>
        ))}
      </div>
      
      <div className="activity-bottom">
        <div className="activity-item" title="Account">
          <span className="activity-icon">👤</span>
        </div>
      </div>
    </div>
  );
}

export default ActivityBar;