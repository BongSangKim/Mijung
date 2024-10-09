import { useEffect, useState, useRef } from 'react';
import { IngredientCosineResponse } from '../../shared/api/ingredientTypes';
import IngredientClient from '../../shared/api/ingredientClient';
import { useNavigate } from 'react-router-dom';
import * as d3 from 'd3';
import { PulseLoader } from 'react-spinners';
import { FaInfoCircle } from 'react-icons/fa';

interface NetworkGraphCardProps {
  graphId: number;
  title: string;
  width?: number | string;
  height?: number;
  fontSizes?: { center: number; depth1: number; depth2: number };
}

interface Node {
  id: number;
  name: string;
  group: number;
}

interface Link {
  source: number;
  target: number;
  value: number;
}
const NetworkGraphCard = ({
  graphId,
  title,
  width = '100%',
  height = 400,
  fontSizes = { center: 24, depth1: 16, depth2: 12 },
}: NetworkGraphCardProps) => {
  const [data, setData] = useState<{ nodes: Node[]; links: Link[] } | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const navigate = useNavigate();
  const ingredientClient = new IngredientClient();
  const [showTip, setShowTip] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const centerResponse =
          await ingredientClient.getIngredientInfo(graphId);
        console.log('중심 재료 정보 응답:', centerResponse.data);

        const depth1Response =
          await ingredientClient.getNetworkGraphData(graphId);
        console.log('1단계 연관 재료 응답:', depth1Response.data);

        const center = centerResponse.data.data;
        const depth1 = depth1Response.data.data
          .filter((item: IngredientCosineResponse) => item.cosine < 1)
          .sort(
            (a: IngredientCosineResponse, b: IngredientCosineResponse) =>
              b.cosine - a.cosine
          )
          .slice(0, 7);

        const nodes: Node[] = [
          { id: center.ingredientId, name: center.name, group: 1 },
        ];

        const links: Link[] = [];

        const addedNodeIds = new Set<number>([center.ingredientId]);

        // Add depth 1 nodes
        for (const item of depth1) {
          if (!addedNodeIds.has(item.ingredientId)) {
            nodes.push({
              id: item.ingredientId,
              name: item.itemName,
              group: 2,
            });
            addedNodeIds.add(item.ingredientId);
          }
          links.push({
            source: center.ingredientId,
            target: item.ingredientId,
            value: item.cosine,
          });
        }

        // Fetch depth 2 data
        const depth2Promises = depth1.map((d1Item) =>
          ingredientClient.getNetworkGraphData(d1Item.ingredientId)
        );
        const depth2Responses = await Promise.all(depth2Promises);

        depth2Responses.forEach((depth2Response, index) => {
          console.log('2단계 연관 재료 응답:', depth2Response.data);
          const depth2 = depth2Response.data.data
            .filter(
              (item: IngredientCosineResponse) =>
                item.cosine < 1 &&
                !addedNodeIds.has(item.ingredientId) &&
                item.ingredientId !== center.ingredientId
            )
            .sort(
              (a: IngredientCosineResponse, b: IngredientCosineResponse) =>
                b.cosine - a.cosine
            )
            .slice(0, 2);

          for (const d2Item of depth2) {
            if (!addedNodeIds.has(d2Item.ingredientId)) {
              nodes.push({
                id: d2Item.ingredientId,
                name: d2Item.itemName,
                group: 3,
              });
              addedNodeIds.add(d2Item.ingredientId);
              links.push({
                source: depth1[index].ingredientId,
                target: d2Item.ingredientId,
                value: d2Item.cosine,
              });
            }
          }
        });

        setData({ nodes, links });
      } catch (err) {
        setError('현재 이 식재료의 네트워크 그래프 정보가 충분하지 않아요.');
        console.error('Error fetching network graph data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [graphId]);

  useEffect(() => {
    if (data && svgRef.current) {
      const svg = d3.select(svgRef.current);
      svg.selectAll('*').remove();

      const containerWidth = svgRef.current.clientWidth;
      const containerHeight = height;

      svg.attr('width', containerWidth).attr('height', containerHeight);

      const viewBox = {
        x: -containerWidth / 2,
        y: -containerHeight / 2,
        width: containerWidth,
        height: containerHeight,
      };
      svg.attr(
        'viewBox',
        `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`
      );

      // 폰트 크기를 동적으로 결정하는 함수
      const getFontSize = (d: Node) => {
        switch (d.group) {
          case 1:
            return fontSizes.center;
          case 2:
            return fontSizes.depth1;
          case 3:
            return fontSizes.depth2;
          default:
            return fontSizes.depth2;
        }
      };

      const simulation = d3
        .forceSimulation(data.nodes as any)
        .force(
          'link',
          d3
            .forceLink(data.links)
            .id((d: any) => d.id)
            .distance((d: any) => {
              // 길이를 60%로 줄이기
              return ((1 - d.value) * 300 + 30) * 0.6;
            })
        )
        .force('charge', d3.forceManyBody().strength(-200)) // 노드 간 반발력을 약간 줄임
        .force('center', d3.forceCenter(0, 0))
        .force(
          'collision',
          d3.forceCollide().radius((d: any) => {
            return d.group === 1 ? 32 : d.group === 2 ? 24 : 16;
          })
        );

      const link = svg
        .append('g')
        .selectAll('line')
        .data(data.links)
        .join('line')
        .attr('stroke', '#999')
        .attr('stroke-opacity', 0.6)
        .attr('stroke-width', (d) => Math.sqrt(d.value) * 2);

      // 노드 그룹 생성
      const nodeGroup = svg
        .append('g')
        .selectAll('g')
        .data(data.nodes)
        .join('g')
        .call(drag(simulation) as any);

      // 원 추가
      nodeGroup
        .append('circle')
        .attr('r', (d) => (d.group === 1 ? 40 : d.group === 2 ? 28 : 20))
        .attr('fill', (d) =>
          d.group === 1 ? '#ff9999' : d.group === 2 ? '#99ff99' : '#9999ff'
        );

      // 텍스트 추가
      nodeGroup
        .append('text')
        .text((d) => d.name)
        .attr('font-size', getFontSize)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .style('user-select', 'none')
        .style('-webkit-user-select', 'none')
        .style('-moz-user-select', 'none')
        .style('-ms-user-select', 'none')
        .style('pointer-events', 'none');

      nodeGroup.on('click', (_event: any, d: Node) => {
        if (d.id !== graphId) {
          navigate(`/ingredients/${d.id}`);
        }
      });

      simulation.on('tick', () => {
        link
          .attr('x1', (d: any) => d.source.x)
          .attr('y1', (d: any) => d.source.y)
          .attr('x2', (d: any) => d.target.x)
          .attr('y2', (d: any) => d.target.y);

        nodeGroup.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
      });

      function drag(
        simulation: d3.Simulation<d3.SimulationNodeDatum, undefined>
      ) {
        function dragstarted(event: any) {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          event.subject.fx = event.subject.x;
          event.subject.fy = event.subject.y;
        }

        function dragged(event: any) {
          event.subject.fx = event.x;
          event.subject.fy = event.y;
        }

        function dragended(event: any) {
          if (!event.active) simulation.alphaTarget(0);
          event.subject.fx = null;
          event.subject.fy = null;
        }

        return d3
          .drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended)
          .filter((event) => {
            return !event.button && !event.ctrlKey;
          })
          .clickDistance(10);
      }

      simulation.alpha(0.3).alphaDecay(0.02).velocityDecay(0.3);
    }
  }, [data, width, height, navigate, graphId, fontSizes]);

  const toggleTip = (event: React.MouseEvent) => {
    event.stopPropagation();
    setShowTip(!showTip);
  };

  const closeTip = () => {
    setShowTip(false);
  };

  useEffect(() => {
    if (showTip) {
      document.addEventListener('click', closeTip);
    }
    return () => {
      document.removeEventListener('click', closeTip);
    };
  }, [showTip]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <PulseLoader color="#4A90E2" size={15} margin={2} />
          <p className="mt-4 text-gray-600">
            네트워크 그래프를 생성하고 있습니다...
          </p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex justify-center items-center h-full text-red-500">
          {error}
        </div>
      );
    }

    if (!data) {
      return (
        <div className="flex justify-center items-center h-full text-gray-500">
          데이터가 없습니다.
        </div>
      );
    }

    return (
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ maxWidth: '100%', height: 'auto', userSelect: 'none' }}
      />
    );
  };

  return (
    <div className="relative flex flex-col w-full h-full bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <button
          onClick={toggleTip}
          className="text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <FaInfoCircle size={20} />
        </button>
      </div>
      <div className="w-full h-full flex items-center justify-center">
        {renderContent()}
      </div>
      {showTip && (
        <div className="absolute top-12 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10 max-w-sm">
          <p className="text-sm text-gray-600 whitespace-pre-line">
            {`안녕하세요! 이 멋진 그래프, 어떻게 만들어졌는지 궁금하셨죠? 😊

• 가운데 큰 동그라미는 여러분이 고른 재료예요.
• 주변의 동그라미들은 이 재료와 찰떡궁합인 재료들이에요.
• 선이 짧을수록 더 자주 함께 쓰이는 재료랍니다.
• 각 동그라미를 클릭하면 해당 식재료의 상세 정보를 볼 수 있어요!

이 모든 정보는 수많은 레시피 데이터를 분석해서 만들었어요.
코사인 유사도 분석으로 재료 간 관계를 계산했답니다!

새로운 요리 조합을 찾고 계셨다면, 이 그래프로 쉽게 찾을 수 있을 거예요.
동그라미들을 클릭해서 다양한 재료들을 탐험해보세요!
맛있는 요리 만드세요! 🍳✨`}
          </p>
        </div>
      )}
    </div>
  );
};

export default NetworkGraphCard;
