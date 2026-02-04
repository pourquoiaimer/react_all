import { useEffect, useState, useContext } from "react";
import {
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
} from "recharts";
// import { useDispatch } from "react-redux";
import { setPageTitle } from "../store/headerSlice"; // 引入我們定義的 Action
// import { AllData } from "../App";
//嘗試fetch寫
const Weather = () => {
  const [weatherData, setWeatherData] = useState("");
  const [city_list, setCity_list] = useState([]);
  const [now_city, setNow_city] = useState("");
  const [nowWeatherData, setNowWeatherData] = useState("");
  const [nowTime, setNowTime] = useState("");
  // console.log(nowDate.getHours());
  // const { setNowShow } = useContext(AllData);
  // useEffect(() => {
  //   setNowShow("天氣");
  // }, [setNowShow]);
  // const dispatch = useDispatch();
  // useEffect(() => {
  //   // 2. 發送 Action 來修改 Redux 裡的 title
  //   // 這裡傳入的 "字數計算" 會變成 action.payload
  //   dispatch(setPageTitle("天氣"));

  //   // 組件卸載時(離開這頁)，你可以選擇是否要改回預設標題，或是在 Home 頁面設回來
  //   return () => dispatch(setPageTitle("綜合頁面"));
  // }, [dispatch]);


  
  useEffect(() => {
    fetch(
      "https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=CWA-23ED0872-47D9-4D97-A9BF-A6182904FD12&format=JSON&locationName="
    )
      .then((response) => {
        return response.json();
      })
      .then((response) => {
        let temp_list = [];

        response.records.location.map(function (data) {
          temp_list.push(data.locationName);
        });
        setCity_list(temp_list);
        setWeatherData(response.records);
        let now_time =
          response.records.location[0].weatherElement[0].time[0].startTime
            .split(" ")[1]
            .split(":")[0] == 18
            ? "今天晚上"
            : "今天白天";
        console.log(now_time);
        setNowTime(now_time);
      })
      .catch((error) => {
        console.log(`Error: ${error}`);
      });
  }, []);

  function WeatherChart() {
    // console.log(nowWeatherData);

    const data = [
      {
        name: nowTime,
        天氣: nowWeatherData.weatherElement[0].time[2].parameter.parameterName,
        最低溫度:
          nowWeatherData.weatherElement[2].time[0].parameter.parameterName,
        最高溫度:
          nowWeatherData.weatherElement[4].time[0].parameter.parameterName,
      },
      {
        name: nowTime == "今天白天" ? "今天晚上" : "明天白天",
        天氣: nowWeatherData.weatherElement[0].time[2].parameter.parameterName,
        最低溫度:
          nowWeatherData.weatherElement[2].time[1].parameter.parameterName,
        最高溫度:
          nowWeatherData.weatherElement[4].time[1].parameter.parameterName,
      },
      {
        name: nowTime == "今天白天" ? "明天白天" : "明天晚上",
        天氣: nowWeatherData.weatherElement[0].time[2].parameter.parameterName,
        最低溫度:
          nowWeatherData.weatherElement[2].time[2].parameter.parameterName,
        最高溫度:
          nowWeatherData.weatherElement[4].time[2].parameter.parameterName,
      },
    ];

    return (
      <LineChart
        width={900}
        height={450}
        data={data}
        margin={{ top: 25, right: 30, left: 20, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3" vertical={false} />
        <XAxis dataKey="name" padding={{ left: 50, right: 50 }} />
        <YAxis height={510} />
        <Tooltip />
        <Legend padding={{ top: 50 }} />
        <Line type="monotone" dataKey="最高溫度" stroke="#8884d8" />
        <Line type="monotone" dataKey="最低溫度" stroke="#82ca9d" />
        <Line type="monotone" dataKey="天氣" stroke="red" />
      </LineChart>
    );
  }

  function change_city(e) {
    let city = e.target.value;
    let nowWeatherData;
    weatherData.location.map(function (data) {
      if (data.locationName == city) {
        nowWeatherData = data;
      }
    });

    setNow_city(city);
    setNowWeatherData(nowWeatherData);
  }

  return (
    <>
      {weatherData != "" ? (
        <>
          {city_list.length != 0 && (
            <div>
              {/* <div>{city_list}</div> */}
              <select
                name=""
                id="city_list"
                onChange={(e) => {
                  change_city(e);
                }}
              >
                <option value="none" selected disabled hidden>
                  請選擇城市
                </option>
                {city_list.map(function (data, index) {
                  return (
                    <option value={data} key={index}>
                      {data}
                    </option>
                  );
                })}
              </select>

              <div style={{ margin: "auto 0", padding: "30px" }}>
                {weatherData.location.map(function (data) {
                  if (data.locationName == now_city) {
                    return (
                      <>
                        <WeatherChart />
                      </>
                    );
                  } else {
                    return null;
                  }
                })}
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <div>沒抓到</div>
        </>
      )}
    </>
  );
};
export default Weather;
