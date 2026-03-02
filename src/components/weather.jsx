import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const Weather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [city_list, setCity_list] = useState([]);
  const [now_city, setNow_city] = useState("");
  const [nowWeatherData, setNowWeatherData] = useState(null);

  useEffect(() => {
    fetch(
      "https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=CWA-23ED0872-47D9-4D97-A9BF-A6182904FD12&format=JSON"
    )
      .then((response) => response.json())
      .then((response) => {
        const temp_list = response.records.location.map(data => data.locationName);
        setCity_list(temp_list);
        setWeatherData(response.records);
      })
      .catch((error) => {
        console.log(`Error: ${error}`);
      });
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip" style={{backgroundColor: '#fff', border: '1px solid #ccc', padding: '10px', borderRadius: '5px'}}>
          <p className="label"><strong>{`${label}`}</strong></p>
          <p style={{color: '#ff7300'}}>{`最高溫度 : ${data.最高溫度}°C`}</p>
          <p style={{color: '#387908'}}>{`最低溫度 : ${data.最低溫度}°C`}</p>
          <p style={{color: '#8884d8'}}>{`降雨機率 : ${data.降雨機率}%`}</p>
          <p>{`天氣狀況 : ${data.天氣狀況}`}</p>
        </div>
      );
    }
    return null;
  };

  function WeatherInfo() {
    if (!nowWeatherData) return null;

    const startTimeHour = new Date(nowWeatherData.weatherElement[0].time[0].startTime).getHours();
    const timeLabels = startTimeHour < 12
        ? ['今天白天', '今天晚上', '明天白天']
        : ['今天晚上', '明天白天', '明天晚上'];

    const chartData = timeLabels.map((label, index) => {
        if (!nowWeatherData.weatherElement[0].time[index]) return null;
        return {
            name: label,
            天氣狀況: nowWeatherData.weatherElement[0].time[index].parameter.parameterName,
            降雨機率: parseInt(nowWeatherData.weatherElement[1].time[index].parameter.parameterName, 10),
            最低溫度: parseInt(nowWeatherData.weatherElement[2].time[index].parameter.parameterName, 10),
            最高溫度: parseInt(nowWeatherData.weatherElement[4].time[index].parameter.parameterName, 10),
        };
    }).filter(Boolean);

    const chartWidth = 900;
    const chartHeight = 550; // Increased height
    const cardWidth = 220;
    const chartMargin = { top: 280, right: 30, left: 20, bottom: 5 }; // Increased top margin
    const plotAreaWidth = chartWidth - chartMargin.left - chartMargin.right;

    return (
        <div style={{ position: 'relative', width: chartWidth, margin: '20px auto' }}>
            {/* Info Cards Overlay */}
            <div style={{
                position: 'absolute',
                top: '20px',
                left: chartMargin.left,
                width: plotAreaWidth,
                display: 'flex',
                justifyContent: 'space-between',
                zIndex: 10
            }}>
                {chartData.map((period, index) => (
                    <div key={index} style={{
                        border: '1px solid #ddd',
                        padding: '10px 15px',
                        borderRadius: '8px',
                        width: cardWidth,
                        backgroundColor: 'rgba(249, 249, 249, 0.85)',
                        backdropFilter: 'blur(5px)',
                        textAlign: 'center',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                    }}>
                        <h4>{period.name}</h4>
                        <p style={{fontSize: '1.2em', fontWeight: 'bold', margin: '5px 0'}}>{period.天氣狀況}</p>
                        <p style={{margin: '5px 0'}}>溫度: {period.最低溫度}°C - {period.最高溫度}°C</p>
                    </div>
                ))}
            </div>

            <LineChart
                width={chartWidth}
                height={chartHeight}
                data={chartData}
                margin={chartMargin}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={false} />
                <YAxis label={{ value: '溫度 (°C)', angle: -90, position: 'insideLeft' }}/>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ top: 240, left: 25 }} /> {/* Adjusted legend position */}
                <Line type="monotone" dataKey="最高溫度" stroke="#ff7300" strokeWidth={2} name="最高溫度" />
                <Line type="monotone" dataKey="最低溫度" stroke="#387908" strokeWidth={2} name="最低溫度" />
            </LineChart>
        </div>
    );
  }

  function change_city(e) {
    const city = e.target.value;
    const cityData = weatherData.location.find(data => data.locationName === city);
    setNow_city(city);
    setNowWeatherData(cityData);
  }

  return (
    <>
      {weatherData ? (
        <div style={{padding: '20px'}}>
          <select
            name="city_list"
            id="city_list"
            onChange={change_city}
            defaultValue="none"
            style={{marginBottom: '20px', padding: '5px'}}
          >
            <option value="none" disabled hidden>
              請選擇城市
            </option>
            {city_list.map((data, index) => (
              <option value={data} key={index}>
                {data}
              </option>
            ))}
          </select>
          
          {nowWeatherData ? <WeatherInfo /> : <div style={{textAlign: 'center', marginTop: '20px'}}>請選擇一個城市來查看天氣資訊</div>}
        </div>
      ) : (
        <div style={{textAlign: 'center', marginTop: '50px'}}>天氣資料載入中...</div>
      )}
    </>
  );
};
export default Weather;
