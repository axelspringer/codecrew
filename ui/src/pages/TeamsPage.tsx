import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';

import { CodeCrewButton, ExtDepFilter, filterTeamsByExtDep, Navbar, TeamDetails, TeamList } from '../components';
import { useState } from 'react';
import { useSearchParams, createSearchParams, useNavigate } from 'react-router-dom';
import { PageData } from '../App';

export default TeamsPage

function TeamsPage ({ users, teams, userExt, userDeps }: PageData) {
    const getSelectedTeam = (selectedTeam: string) => {
        for (const team of teams) {
            const { name } = team
            if (name === selectedTeam) {
                return team
            }
        }
        
        return undefined
    }

    const [searchParams] = useSearchParams();
    const [teamData, setTeamData] = useState(getSelectedTeam(searchParams.get('team') || ''))
    
    const navigate = useNavigate()
    const handleTeamClick = (team: string) => {
        setTeamData(getSelectedTeam(team))
        navigate({
            search: `?${createSearchParams({ team })}`
        })
    }

    const [filteredTeams, setFilteredTeams] = useState(teams)
    const handleFilterChange = (newFilterValues: string[]) => {
        setFilteredTeams(filterTeamsByExtDep(teams, newFilterValues))
    }

    return (
        <Grid container spacing={2}>
            <Grid item xs={1} />
            <Grid item xs={7}>
                <Navbar items={['developers', 'teams']} value='teams' onChange={(newTab: string) => newTab !== 'teams' && navigate({ pathname: '/' })} />
                <Paper style={{ marginBottom: 15, marginTop: 5 }}>
                    <ExtDepFilter userExt={userExt} userDeps={userDeps} onFilterChange={handleFilterChange} />
                </Paper>
                <Paper>
                    <TeamList teams={filteredTeams} users={users} onTeamClick={handleTeamClick} onUserClick={(newUser: string) => console.log('Navigating to user: ', newUser)} />
                </Paper>
            </Grid>
            <Grid item xs={3}>
                <div style={{ position: 'fixed', left: 3, top: 3 }}>
                    <CodeCrewButton/>
                </div>
                <div style={{ position: 'fixed', top: 50, overflow: 'scroll', height: 'calc(100% - 50px)' }}>
                    <TeamDetails team={teamData} teams={teams} users={users} onTeamClick={handleTeamClick} />
                </div>
            </Grid>
            <Grid item xs={1} />
        </Grid>
    )
}