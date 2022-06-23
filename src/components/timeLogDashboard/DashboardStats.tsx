import React, { useEffect, useState } from 'react';
import { MainWrapperComponent } from 'techsbcn-storybook';
import { _VALUES } from '../../resources/_constants/values';
import { GetParentsWorkItemsNode } from '../../redux/workItem/workItemAPI';
import { usePrevious } from '../../helpers';

interface DashboardStatsProps {
  workItemIds: number[];
  loading: boolean;
}

const DashboardStats: React.FC<DashboardStatsProps> = (props) => {
  //const [workItems, setWorkItems] = useState<any[]>();
  //const [workItemsLoading, setWorkItemsLoading] = React.useState(false);
  const prevWorkItemsState = usePrevious(JSON.stringify(props.workItemIds));
  useEffect(() => {
    //setWorkItemsLoading(true);
    if (prevWorkItemsState != JSON.stringify(props.workItemIds) && props.workItemIds.length > 0) {
      GetParentsWorkItemsNode(props.workItemIds)
        .then((result) => {
          //setWorkItems(result);
          console.log(result);
          //setWorkItemsLoading(false);
        })
        .catch((error) => {
          //setError(error.Message);
          //setWorkItems([]);
          //setWorkItemsLoading(false);
        });
    }
  }, [prevWorkItemsState, props.workItemIds]);

  return (
    <MainWrapperComponent
      headerProps={{
        title: _VALUES.STATS,
      }}
    ></MainWrapperComponent>
  );
};

export default DashboardStats;
