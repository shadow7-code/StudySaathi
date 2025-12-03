// React Weekly Graph Component for real-time data updates
const { useState, useEffect, useRef, createElement } = React;

const WeeklyGraph = ({ title = "Weekly Study Progress" }) => {
  const [data, setData] = useState([]);
  const [labels, setLabels] = useState([]);
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    // Get weekly data from localStorage
    const updateData = () => {
      if (typeof Storage === 'undefined') {
        setTimeout(updateData, 100);
        return;
      }

      const history = Storage.getTimerHistory();
      const days = [];
      const studyData = [];

      // Get last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);
        
        const dayHistory = history.filter(session => {
          const sessionDate = new Date(session.date);
          return sessionDate >= date && sessionDate < nextDate && session.mode === 'study';
        });
        
        const minutes = dayHistory.reduce((total, session) => total + (session.duration / 60), 0);
        
        days.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
        studyData.push(Math.round(minutes));
      }

      setLabels(days);
      setData(studyData);
    };

    // Initial load
    updateData();

    // Update every 30 seconds for real-time data
    const interval = setInterval(updateData, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!canvasRef.current || labels.length === 0 || typeof Chart === 'undefined') return;

    // Destroy existing chart if it exists
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    // Create new chart
    const ctx = canvasRef.current.getContext('2d');
    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Minutes Studied',
          data: data,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true,
          borderWidth: 3,
          pointRadius: 6,
          pointBackgroundColor: 'rgb(59, 130, 246)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointHoverRadius: 8,
          pointHoverBackgroundColor: 'rgb(59, 130, 246)',
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleFont: {
              size: 14,
              weight: 'bold'
            },
            bodyFont: {
              size: 13
            },
            callbacks: {
              label: function(context) {
                return `${context.parsed.y} minutes studied`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return value + 'm';
              },
              font: {
                size: 11
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            ticks: {
              font: {
                size: 11
              }
            },
            grid: {
              display: false
            }
          }
        },
        animation: {
          duration: 1000,
          easing: 'easeInOutQuart'
        }
      }
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [data, labels]);

  return createElement('div', {
    className: 'bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]'
  }, [
    createElement('h2', {
      key: 'title',
      className: 'text-xl font-bold text-gray-900 dark:text-white mb-6'
    }, title),
    createElement('div', {
      key: 'chart-container',
      className: 'relative h-[300px] w-full'
    }, [
      createElement('canvas', {
        key: 'chart',
        ref: canvasRef,
        className: 'w-full h-full'
      })
    ])
  ]);
};

