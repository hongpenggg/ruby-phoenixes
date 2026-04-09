import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Calendar, Users, Activity, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';

export default function Dashboard() {
  const { profile } = useAuthStore();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Welcome back, {profile?.full_name || 'Player'}!
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Here's what's happening with the Ruby Phoenixes.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Event</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Sat, 10 AM</div>
            <p className="text-xs text-muted-foreground">Training @ Kovan</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My RSVPs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Upcoming games</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+15%</div>
            <p className="text-xs text-muted-foreground">Passing accuracy this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leadership</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Level 2</div>
            <p className="text-xs text-muted-foreground">Assistant Coach Track</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Placeholder for events */}
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <p className="font-medium">Weekend Training</p>
                  <p className="text-sm text-muted-foreground">Sat, Oct 28 • 10:00 AM</p>
                </div>
                <Button variant="outline" size="sm">RSVP</Button>
              </div>
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <p className="font-medium">Friendly vs. Lions</p>
                  <p className="text-sm text-muted-foreground">Sun, Nov 5 • 4:00 PM</p>
                </div>
                <Button variant="outline" size="sm">RSVP</Button>
              </div>
            </div>
            <Button asChild variant="link" className="mt-4 px-0">
              <Link to="/events">View all events &rarr;</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>My Development</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Passing</span>
                  <span className="text-sm font-medium">75%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-red-700 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Endurance</span>
                  <span className="text-sm font-medium">6/10</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Tackling</span>
                  <span className="text-sm font-medium">82%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-red-700 h-2 rounded-full" style={{ width: '82%' }}></div>
                </div>
              </div>
            </div>
            <Button asChild variant="link" className="mt-6 px-0">
              <Link to={`/profile/${profile?.id}`}>View full profile &rarr;</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
