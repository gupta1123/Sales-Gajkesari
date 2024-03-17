import { Card, CardContent } from "@/components/ui/card";

const PerformanceMetrics = () => {
  // Dummy performance metrics data
  const metrics = {
    duration: "45 minutes",
    salesGenerated: "$1,500",
    successRate: "80%",
  };

  return (
<Card className="shadow-lg">
  <CardContent className="p-6">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-blue-100 rounded-lg p-4">
        <p className="text-sm text-blue-500 font-medium">Visit Duration</p>
        <p className="text-2xl font-bold text-blue-800">{metrics.duration}</p>
      </div>
      <div className="bg-green-100 rounded-lg p-4">
        <p className="text-sm text-green-500 font-medium">Sales Generated</p>
        <p className="text-2xl font-bold text-green-800">{metrics.salesGenerated}</p>
      </div>
      <div className="bg-purple-100 rounded-lg p-4">
        <p className="text-sm text-purple-500 font-medium">Success Rate</p>
        <p className="text-2xl font-bold text-purple-800">{metrics.successRate}</p>
      </div>
    </div>
  </CardContent>
</Card>
  );
};

export default PerformanceMetrics;