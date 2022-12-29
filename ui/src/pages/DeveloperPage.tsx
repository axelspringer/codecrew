import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';

import { CodeCrewButton, ExtDepFilter, filterUsersByExtDep, getTeamsForUsername, Navbar, UserDetails, UserList } from '../components';
import { useState } from 'react';
import { useSearchParams, createSearchParams, useNavigate } from 'react-router-dom';
import { PageData } from '../App';

export default DeveloperPage

function DeveloperPage ({ users, teams, userExt, userDeps }: PageData) {
    const [searchParams] = useSearchParams();
    const [selectedUser, setSelectedUser] = useState(searchParams.get('user') || '')
    
    const navigate = useNavigate()
    const handleUserClick = (user: string) => {
        setSelectedUser(user)
        navigate({
            search: `?${createSearchParams({ user })}`
        })
    }

    const handleTeamClick = (team: string) => {
        navigate({
            pathname: '/teams',
            search: `?${createSearchParams({ team })}`
        })
    }

    const [filteredUsers, setFilteredUsers] = useState(users)
    const handleFilterChange = (newFilterValues: string[]) => {
        setFilteredUsers(filterUsersByExtDep(users, newFilterValues))
    }

    return (
        <Grid container spacing={2}>
            <Grid item xs={1} />
            <Grid item xs={7}>
                <Navbar items={['developers', 'teams']} value='developers' onChange={(newTab: string) => newTab !== 'developers' && navigate({ pathname: '/teams' })} />
                <Paper style={{ marginBottom: 15, marginTop: 5 }}>
                    <ExtDepFilter userExt={userExt} userDeps={userDeps} onFilterChange={handleFilterChange} />
                </Paper>
                <Paper>
                    <UserList users={filteredUsers} teams={teams} onUserClick={handleUserClick} onTeamClick={handleTeamClick} />
                </Paper>
            </Grid>
            <Grid item xs={3}>
                <div style={{ position: 'fixed', left: 3, top: 3 }}>
                    <CodeCrewButton/>
                </div>
                <div style={{ position: 'fixed', top: 50, overflow: 'scroll', height: 'calc(100% - 50px)' }}>
                    <UserDetails user={users[selectedUser]} userTeams={getTeamsForUsername(selectedUser, teams)} onTeamClick={handleTeamClick} />
                </div>
            </Grid>
            <Grid item xs={1} />
        </Grid>
    )
}