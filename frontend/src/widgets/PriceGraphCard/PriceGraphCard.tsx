import React, { useEffect, useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import IngredientClient from '../../shared/api/ingredientClient';

interface PriceGraphCardProps {
  graphId: number;
  title: string;
  height?: number;
}

interface PriceData {
  date: string;
  price: number | null;
  expectedPrice: number | null;
}

const PriceGraphCard: React.FC<PriceGraphCardProps> = ({ graphId, title }) => {
  const [longTermPrices, setLongTermPrices] = useState<PriceData[]>([]);
  const [shortTermPrices, setShortTermPrices] = useState<PriceData[]>([]);
  const [showExpectedPrice, setShowExpectedPrice] = useState(true);
  const [tabIndex, setTabIndex] = useState(0);
  const ingredientClient = new IngredientClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await ingredientClient.getIngredientPredictions(graphId);
        const fetchedData = res.data.data;

        const now = new Date();
        const koreaTimeOffset = 9 * 60 * 60 * 1000;
        const today = new Date(now.getTime() + koreaTimeOffset);
        today.setUTCHours(0, 0, 0, 0);

        const januaryFirst2024 = new Date(Date.UTC(2024, 0, 1));
        const decemberLast2024 = new Date(Date.UTC(2024, 11, 31));

        const oneMonthAgo = new Date(today);
        oneMonthAgo.setUTCMonth(today.getUTCMonth() - 1);

        const oneMonthLater = new Date(today);
        oneMonthLater.setUTCMonth(today.getUTCMonth() + 1);

        const findLatestPrice = (data: PriceData[]) => {
          const sortedData = data
            .filter(
              (item) => new Date(item.date) <= today && item.price !== null
            )
            .sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            );
          return sortedData.length > 0 ? sortedData[0] : null;
        };

        let longTermData = fetchedData.map((item: PriceData) => ({
          date: item.date,
          price:
            new Date(item.date) >= januaryFirst2024 &&
            new Date(item.date) <= today
              ? item.price
              : null,
          expectedPrice:
            new Date(item.date) <= decemberLast2024 ? item.expectedPrice : null,
        }));

        const latestLongTermPrice = findLatestPrice(longTermData);
        if (
          latestLongTermPrice &&
          !longTermData.some(
            (item) => item.date === today.toISOString().split('T')[0]
          )
        ) {
          longTermData.push({
            date: today.toISOString().split('T')[0],
            price: latestLongTermPrice.price,
            expectedPrice: null,
          });
        }

        longTermData = longTermData.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        let shortTermData = fetchedData
          .filter(
            (item: PriceData) =>
              new Date(item.date) >= oneMonthAgo &&
              new Date(item.date) <= oneMonthLater
          )
          .map((item: PriceData) => ({
            date: item.date,
            price: new Date(item.date) <= today ? item.price : null,
            expectedPrice:
              new Date(item.date) > today ? item.expectedPrice : null,
          }));

        const latestShortTermPrice = findLatestPrice(shortTermData);
        if (latestShortTermPrice) {
          shortTermData = [
            {
              date: today.toISOString().split('T')[0],
              price: latestShortTermPrice.price,
              expectedPrice: latestShortTermPrice.price,
            },
            ...shortTermData.filter(
              (item) => item.date !== today.toISOString().split('T')[0]
            ),
          ];
        }

        shortTermData = shortTermData.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        setLongTermPrices(longTermData);
        setShortTermPrices(shortTermData);
      } catch (err) {
        console.error('데이터를 가져오는 중 오류 발생:', err);
      }
    };

    fetchData();
  }, [graphId]);

  const toggleExpectedPrice = () => {
    setShowExpectedPrice(!showExpectedPrice);
  };

  const filteredData = tabIndex === 0 ? shortTermPrices : longTermPrices;

  const { minPrice, maxPrice } = useMemo(() => {
    const allPrices = filteredData
      .flatMap((item) => [
        item.price,
        showExpectedPrice ? item.expectedPrice : null,
      ])
      .filter(
        (price): price is number => price !== null && price !== undefined
      );

    return {
      minPrice: Math.min(...allPrices),
      maxPrice: Math.max(...allPrices),
    };
  }, [filteredData, showExpectedPrice]);

  const yAxisDomain = useMemo(() => {
    const padding = (maxPrice - minPrice) * 0.1;
    return [Math.max(0, minPrice - padding), maxPrice + padding];
  }, [minPrice, maxPrice]);

  const formatYAxis = (value: number) => {
    return value.toLocaleString('ko-KR');
  };

  const renderCustomizedDot = (props: {
    cx: number;
    cy: number;
    payload: PriceData;
  }) => {
    const { cx, cy, payload } = props;
    const now = new Date();
    const koreaTimeOffset = 9 * 60 * 60 * 1000;
    const todayInKorea = new Date(now.getTime() + koreaTimeOffset);
    const todayString = todayInKorea.toISOString().split('T')[0];
    if (payload.date === todayString) {
      return (
        <circle cx={cx} cy={cy} r={4} stroke="red" strokeWidth={2} fill="red" />
      );
    }
    return null;
  };

  return (
    <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-800">
          {title}
        </h2>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 space-y-2 sm:space-y-0 sm:space-x-2">
          <div className="flex space-x-2">
            <button
              className={`px-3 py-1 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 
                ${
                  tabIndex === 0
                    ? 'bg-teal-500 text-white'
                    : 'bg-teal-100 text-teal-700 hover:bg-teal-200 active:bg-teal-300'
                }`}
              onClick={() => setTabIndex(0)}
            >
              단기 시세
            </button>
            <button
              className={`px-3 py-1 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 
                ${
                  tabIndex === 1
                    ? 'bg-teal-500 text-white'
                    : 'bg-teal-100 text-teal-700 hover:bg-teal-200 active:bg-teal-300'
                }`}
              onClick={() => setTabIndex(1)}
            >
              장기 시세
            </button>
          </div>
          <button
            className={`px-3 py-1 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 
              ${
                showExpectedPrice
                  ? 'bg-teal-100 text-teal-700 hover:bg-teal-200 active:bg-teal-300'
                  : 'bg-teal-500 text-white'
              }`}
            onClick={toggleExpectedPrice}
          >
            {showExpectedPrice ? '예상가 숨기기' : '예상가 확인'}
          </button>
        </div>
        <div className="w-full h-[400px]">
          <ResponsiveContainer>
            <LineChart
              data={filteredData}
              margin={{ top: 10, right: 30, left: 10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="date"
                tickFormatter={(dateString) => {
                  const date = new Date(dateString);
                  return `${date.getMonth() + 1}/${date.getDate()}`;
                }}
                tick={{ fontSize: 12 }}
                stroke="#4A5568"
              />
              <YAxis
                domain={yAxisDomain}
                tickFormatter={formatYAxis}
                tick={{ fontSize: 12 }}
                stroke="#4A5568"
              />
              <Tooltip
                formatter={(value: number) => [formatYAxis(value), '가격']}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  borderRadius: '0.375rem',
                  border: 'none',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: '0.5rem' }} />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#2C7A7B"
                name="실제 가격"
                dot={renderCustomizedDot as any} //build용 테스트. 고장나면 체크
                activeDot={{ r: 8 }}
                strokeWidth={3}
              />
              {showExpectedPrice && (
                <Line
                  type="monotone"
                  dataKey="expectedPrice"
                  stroke="#38B2AC"
                  strokeDasharray="5 5"
                  name="예측 가격"
                  dot={false}
                  strokeWidth={3}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default PriceGraphCard;
