import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  Download,
  Calendar,
  TrendingUp,
  Users,
  Laptop,
  Bike,
  AlertCircle,
  Layers,
  GraduationCap,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useReportsData } from "@/hooks/useReportsData";

const numberFormatter = new Intl.NumberFormat("vi-VN");
const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const formatNumber = (value?: number) => numberFormatter.format(value ?? 0);
const formatCurrency = (value?: number) => currencyFormatter.format(Math.max(0, value ?? 0));

export default function Reports() {
  const { data, isLoading, isFetching, error, refetch } = useReportsData();

  const summaryCards = [
    {
      label: "Tổng hỗ trợ tuần này",
      value: formatNumber(data?.summary.totalSupports),
      description: "Bao gồm laptop, xe máy, học phí, linh kiện",
      icon: TrendingUp,
    },
    {
      label: "Sinh viên mới",
      value: formatNumber(data?.summary.newStudents),
      description: "Được duyệt trong 7 ngày gần nhất",
      icon: Users,
    },
    {
      label: "Laptop đã tặng",
      value: formatNumber(data?.summary.laptopsDelivered),
      description: "Đã bàn giao thành công trong tuần",
      icon: Laptop,
    },
    {
      label: "Xe máy đã tặng",
      value: formatNumber(data?.summary.motorbikesDelivered),
      description: "Đã bàn giao thành công trong tuần",
      icon: Bike,
    },
  ];

  const pendingTotal = data?.weeklyBreakdown.reduce((sum, item) => sum + item.pending, 0) ?? 0;

  const weeklyHighlights = [
    {
      label: "Nhà hảo tâm mới",
      value: formatNumber(data?.summary.newDonors),
      description: "Đăng ký trong 7 ngày qua",
      icon: TrendingUp,
    },
    {
      label: "Linh kiện bàn giao",
      value: formatNumber(data?.summary.componentsDelivered),
      description: "Hoàn thành tuần này",
      icon: Layers,
    },
    {
      label: "Học phí đã giải ngân",
      value: formatCurrency(data?.summary.tuitionAmount),
      description: "Tổng chi tuần này",
      icon: GraduationCap,
    },
    {
      label: "Nhu cầu mở",
      value: formatNumber(pendingTotal),
      description: "Sinh viên đang chờ hỗ trợ",
      icon: Users,
    },
  ];

  const monthlyHighlights = [
    {
      label: "Hỗ trợ hoàn tất",
      value: formatNumber(data?.monthlyStats.supportsCompleted),
      description: "Trong tháng hiện tại",
      icon: TrendingUp,
    },
    {
      label: "Sinh viên nhận hỗ trợ",
      value: formatNumber(data?.monthlyStats.studentsSupported),
      description: "Ít nhất một hỗ trợ/tháng",
      icon: Users,
    },
    {
      label: "Nhà hảo tâm mới",
      value: formatNumber(data?.monthlyStats.newDonors),
      description: "Gia nhập tháng này",
      icon: Laptop,
    },
    {
      label: "Giải ngân học phí",
      value: formatCurrency(data?.monthlyStats.tuitionAmount),
      description: "Tổng chi trong tháng",
      icon: GraduationCap,
    },
  ];

  const hasDistributionData = (data?.distribution ?? []).some((item) => item.value > 0);

  return (
    <MainLayout title="Báo cáo" description="Thống kê và báo cáo hoạt động">
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Không thể tải dữ liệu báo cáo</AlertTitle>
          <AlertDescription className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <span>Vui lòng kiểm tra kết nối và thử lại.</span>
            <Button size="sm" variant="outline" onClick={() => refetch()}>
              Thử lại
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => (
              <Card key={`summary-skeleton-${index}`} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                <CardHeader className="space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <Skeleton className="h-7 w-20" />
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            ))
          : summaryCards.map((stat, index) => (
              <Card key={stat.label} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="weekly">Tuần</TabsTrigger>
            <TabsTrigger value="monthly">Tháng</TabsTrigger>
          </TabsList>
          <div className="flex flex-wrap gap-2">
            {isFetching && !isLoading && <span className="text-xs text-muted-foreground">Đang cập nhật dữ liệu...</span>}
            <Button variant="outline" size="sm">
              <Calendar className="mr-2 h-4 w-4" /> Chọn khoảng thời gian
            </Button>
            <Button size="sm">
              <Download className="mr-2 h-4 w-4" /> Xuất báo cáo
            </Button>
          </div>
        </div>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle>Hoạt động trong tuần</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {isLoading ? (
                    <Skeleton className="h-full w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data?.weeklyData ?? []}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="name" className="text-muted-foreground" />
                        <YAxis className="text-muted-foreground" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar dataKey="laptops" name="Laptop" fill="hsl(25, 95%, 53%)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="motorbikes" name="Xe máy" fill="hsl(174, 60%, 40%)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="students" name="Sinh viên" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="donors" name="Nhà hảo tâm" fill="hsl(45, 93%, 47%)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="animate-fade-in" style={{ animationDelay: "100ms" }}>
              <CardHeader>
                <CardTitle>Phân bố hỗ trợ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {isLoading ? (
                    <Skeleton className="h-full w-full" />
                  ) : hasDistributionData ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data?.distribution ?? []}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {(data?.distribution ?? []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-sm text-muted-foreground">Chưa có dữ liệu phân bố trong giai đoạn này</p>
                    </div>
                  )}
                </div>
                <div className="mt-4 flex flex-wrap justify-center gap-4">
                  {(data?.distribution ?? []).map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm text-muted-foreground">
                        {item.name} ({formatNumber(item.value)})
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="animate-fade-in" style={{ animationDelay: "200ms" }}>
            <CardHeader>
              <CardTitle>Xu hướng hỗ trợ 6 tháng qua</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                {isLoading ? (
                  <Skeleton className="h-full w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data?.monthlyTrend ?? []}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" className="text-muted-foreground" />
                      <YAxis className="text-muted-foreground" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        name="Lượt hỗ trợ"
                        stroke="hsl(25, 95%, 53%)"
                        strokeWidth={3}
                        dot={{ fill: "hsl(25, 95%, 53%)", strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {isLoading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <Card key={`weekly-skeleton-${index}`} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                    <CardHeader className="space-y-2">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-3 w-24" />
                    </CardHeader>
                  </Card>
                ))
              : weeklyHighlights.map((highlight, index) => (
                  <Card key={highlight.label} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                    <CardHeader className="space-y-1">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm text-muted-foreground">{highlight.label}</CardTitle>
                        <highlight.icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="text-2xl font-bold">{highlight.value}</div>
                      <p className="text-xs text-muted-foreground">{highlight.description}</p>
                    </CardHeader>
                  </Card>
                ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Chi tiết tiến độ hỗ trợ tuần này</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((row) => (
                    <Skeleton key={row} className="h-10 w-full" />
                  ))}
                </div>
              ) : data?.weeklyBreakdown.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Loại hỗ trợ</TableHead>
                      <TableHead className="text-right">Hoàn thành</TableHead>
                      <TableHead className="text-right">Đang triển khai</TableHead>
                      <TableHead className="text-right">Nhu cầu mở</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.weeklyBreakdown.map((row) => (
                      <TableRow key={row.key}>
                        <TableCell className="font-medium">{row.label}</TableCell>
                        <TableCell className="text-right">{formatNumber(row.completed)}</TableCell>
                        <TableCell className="text-right">{formatNumber(row.inProgress)}</TableCell>
                        <TableCell className="text-right">{formatNumber(row.pending)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">Chưa có dữ liệu hỗ trợ trong tuần này.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {isLoading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <Card key={`monthly-skeleton-${index}`} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                    <CardHeader className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-3 w-20" />
                    </CardHeader>
                  </Card>
                ))
              : monthlyHighlights.map((highlight, index) => (
                  <Card key={highlight.label} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                    <CardHeader className="space-y-1">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm text-muted-foreground">{highlight.label}</CardTitle>
                        <highlight.icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="text-2xl font-bold">{highlight.value}</div>
                      <p className="text-xs text-muted-foreground">{highlight.description}</p>
                    </CardHeader>
                  </Card>
                ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Số liệu theo tháng</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5, 6].map((row) => (
                    <Skeleton key={row} className="h-10 w-full" />
                  ))}
                </div>
              ) : (data?.monthlyTrend.length ?? 0) > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tháng</TableHead>
                      <TableHead className="text-right">Số lượt hỗ trợ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.monthlyTrend.map((item) => (
                      <TableRow key={item.name}>
                        <TableCell className="font-medium uppercase">{item.name}</TableCell>
                        <TableCell className="text-right">{formatNumber(item.value)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">Chưa có dữ liệu hỗ trợ trong 6 tháng gần đây.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
