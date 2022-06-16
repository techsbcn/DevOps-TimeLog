import React, { useEffect } from 'react';
import { UserContext } from '../../interfaces';
import { GetEpicsWorkItemsNode } from '../../redux/workItem/workItemAPI';

interface TimeLogDashboardProps {
  user?: UserContext;
  projectId?: string;
}

const TimeLogDashboard: React.FC<TimeLogDashboardProps> = () => {
  //const [workItems, setWorkItems] = useState<any[]>();
  //const [workItemsLoading, setWorkItemsLoading] = React.useState(false);
  useEffect(() => {
    //setWorkItemsLoading(true);
    GetEpicsWorkItemsNode()
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
  }, []);

  return <div></div>;
};

export default TimeLogDashboard;
