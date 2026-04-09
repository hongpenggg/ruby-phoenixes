import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Link } from 'react-router-dom';
import { Input } from '../components/ui/input';
import { useState } from 'react';
import { Search } from 'lucide-react';

export default function Players() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: players, isLoading } = useQuery({
    queryKey: ['players'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, players(position, is_assistant_coach_candidate)')
        .order('full_name');
      
      if (error) throw error;
      return data as any[];
    },
  });

  const filteredPlayers = players?.filter(p => 
    (p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
     p.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Players & Staff</h1>
          <p className="text-muted-foreground">The Ruby Phoenixes community.</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search players..." 
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div>Loading players...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredPlayers?.map((player) => {
            const playerInfo = player.players?.[0];
            return (
              <Link key={player.id} to={`/profile/${player.id}`}>
                <Card className="hover:border-red-500 transition-colors cursor-pointer h-full">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-lg font-bold text-red-800 shrink-0 overflow-hidden">
                      {player.avatar_url ? (
                        <img src={player.avatar_url} alt={player.full_name || ''} className="w-full h-full object-cover" />
                      ) : (
                        player.full_name?.charAt(0) || player.email.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 line-clamp-1">
                        {player.full_name || 'Anonymous'}
                      </h3>
                      <p className="text-sm text-muted-foreground capitalize">
                        {player.role} {playerInfo?.position ? `• ${playerInfo.position}` : ''}
                      </p>
                      {playerInfo?.is_assistant_coach_candidate && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-[10px] font-medium">
                          Coach Track
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
