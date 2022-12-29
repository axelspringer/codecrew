import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';

import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Stack from '@mui/material/Stack';

import GitHubIcon from '@mui/icons-material/GitHub';
import MailIcon from '@mui/icons-material/Mail';
import GroupIcon from '@mui/icons-material/Group';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CampaignIcon from '@mui/icons-material/Campaign';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';

import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import { UITeam, UITeams, UIUser, UIUsers } from './helper/types'
import { getVSIFileIcon } from "file-extension-icon-js"
import { supportsFileExt } from './helper/supportedFileExts';
import { useState } from 'react';

/*
    COMPONENTS
 */
export const UserList = ({ users, teams, onUserClick, onTeamClick }: { users: UIUsers, teams: UITeams, onUserClick: (userName: string) => void, onTeamClick: (team: string) => void }) => (
    <List sx={{ width: '100%', height: '100%', overflow: 'scroll', bgcolor: 'background.paper' }}>
        {
            Object.entries(users).map(([,{
                ghUserName,
                name,
                url,
                avatarUrl,
                Ext,
                Dep,
            }]) => {
                const depCount = getDepCount(Dep)
                return (
                    <ListItem>
                        <ListItemButton onClick={() => onUserClick(ghUserName)}>
                            <ListItemAvatar>
                                <Avatar alt={url} src={avatarUrl} />
                            </ListItemAvatar>
                            <ListItemText
                                primary={name || ghUserName}
                                secondary={
                                    <>
                                        <Typography
                                            sx={{ display: 'inline' }}
                                            component="span"
                                            variant="body2"
                                            color="text.primary"
                                        >
                                            <SkllsLabel ext={Ext}/>
                                        </Typography>
                                        { depCount > 0 && <div>{`${depCount} dependencies`}</div> }
                                        <div>
                                            <TeamLinks teams={getTeamsForUsername(ghUserName, teams)} onClick={onTeamClick} />
                                        </div>
                                    </>
                                }
                            />
                            &nbsp;&nbsp;&nbsp;
                            <IconButton aria-label="delete" edge="end">
                                <GitHubIcon
                                    onClick={() => window.open(url, '_blank')}
                                />
                            </IconButton>
                        </ListItemButton>
                    </ListItem>
                )
            })
        }
    </List>
)

const getReachoutEmailTemplate = (email: string) => `mailto:${email}?subject=Found%20you%20on%20codecrew%20%3A)&body=%0D%0A%0D%0APS%3A%20You%20can%20checkout%20codecrew%20here%3A%20https%3A%2F%2Fspring-media.github.io%2Fcodecrew`

export const UserDetails = ({ user, userTeams, onTeamClick }: { user?: UIUser, userTeams: UITeams, onTeamClick: (team: string) => void }) => {
    if (!user) {
        return <div>👇🏻 Select user below to get started</div>
    }

    const { name, ghUserName, email, location, avatarUrl, url, bio, LastCommit, Dep } = user
    return (
        <Card>
            <CardHeader
                avatar={<Avatar alt={url} src={avatarUrl} />}
                title={ name || ghUserName }
                subheader={`${location ? `${location} • ` : ''} ${bio ? `${bio} • ` : ''} ${new Date(LastCommit).toDateString()} (last commit)`}
            />
            <CardContent>
                <Stack direction='row' spacing={1} sx={{ marginTop: -2, marginBottom: 2 }}>
                    <Button startIcon={<MailIcon/>} variant="outlined" size="small" onClick={() => window.open(getReachoutEmailTemplate(email), '_blank')}>
                        Send Email
                    </Button>
                    <Button startIcon={<GitHubIcon/>} variant="outlined" size="small" onClick={() => window.open(url, '_blank')}>
                        Github Profile
                    </Button>
                </Stack>
                <Box sx={{ marginBottom: 2 }}>
                    <Typography variant='h6'>Teams</Typography>
                    <TeamLinks teams={userTeams} onClick={onTeamClick} />
                </Box>
                <Box sx={{ marginBottom: 2 }}>
                    <DependencyList deps={Dep} />
                    <Divider sx={{ marginTop: 5 }} />
                </Box>

            </CardContent>
        </Card>
    )
}

export const TeamMemberCard = ({ user, onOpenUserDetails }: { user: UIUser, onOpenUserDetails: (ghUserName: string) => void }) => {
    const { name, ghUserName, avatarUrl, Dep, Ext } = user
    const depCount = getDepCount(Dep)

    return (
        <Stack direction="row" justifyContent='space-between' spacing={1}>
            <Avatar src={avatarUrl} alt={ghUserName}/>
            <div style={{ flex: 1 }}>
                <div><Typography>{ name || ghUserName }</Typography></div>
                { depCount > 0 && <Typography variant='overline'>{`${depCount} dependencies`}</Typography> }
                <div><SkllsLabel ext={Ext} /></div>
            </div>
            <div>
                <Button variant="outlined" size="small" onClick={() => onOpenUserDetails(ghUserName)}>
                    Full profile
                </Button>
                <IconButton onClick={() => window.open(`https://www.github.com/${ghUserName}`, '_blank')}>
                    <GitHubIcon/>
                </IconButton>
            </div>
        </Stack>
    )
}

export const UserDetailsDialog = ({ ghUserName, users, teams, onClose, onTeamClick }: { ghUserName: string, users: UIUsers, teams: UITeams, onClose: () => void, onTeamClick: (teamName: string) => void }) => {
    const user = users[ghUserName]
    const { name } = user
    const userTeams = getTeamsForUsername(ghUserName, teams)

    return (
        <Dialog
            open={ghUserName !== ''}
            onClose={onClose}
        >
            <DialogTitle id="alert-dialog-title">
                {name || ghUserName}
            </DialogTitle>
            <DialogContent>
            <DialogContentText id="alert-dialog-description">
                <UserDetails user={user} userTeams={userTeams} onTeamClick={onTeamClick}/>
            </DialogContentText>
            </DialogContent>
            <DialogActions>
            <Button onClick={onClose} autoFocus>
                Okay
            </Button>
            </DialogActions>
        </Dialog>
    )
}

export const GithubAvatar = ({ ghUserName, avatarUrl }: { ghUserName: string, avatarUrl: string }) => (
    <Chip
        size='small'
        style={{ margin: 3 }}
        label={ghUserName}
        avatar={<Avatar alt={ghUserName} src={avatarUrl} />}
        component="a"
        href={`https://www.github.com/${ghUserName}`}
        target="_blank"
        clickable
    />
)

export const TeamList = ({ teams, onTeamClick }: { users: UIUsers, teams: UITeams, onUserClick: (userName: string) => void, onTeamClick: (team: string) => void }) => {
    return (
        <List sx={{ width: '100%', height: '100%', overflow: 'scroll', bgcolor: 'background.paper' }}>
            {
                teams.map(({
                    name,
                    avatarUrl,
                    teamsUrl,
                    members,
                    Ext,
                    Dep,
                }) => {
                    const depCount = getDepCount(Dep)
                    return (
                        <ListItem>
                            <ListItemButton onClick={() => onTeamClick(name)}>
                                <ListItemAvatar>
                                    <Avatar alt={teamsUrl} src={avatarUrl} />
                                </ListItemAvatar>
                                <ListItemText
                                    primary={name}
                                    secondary={
                                        <>
                                            <Typography
                                                sx={{ display: 'inline' }}
                                                component="span"
                                                variant="body2"
                                                color="text.primary"
                                            >
                                            <SkllsLabel ext={Ext}/>
                                            </Typography>
                                            { depCount > 0 && <div>{`${depCount} dependencies`}</div> }
                                            <div>
                                                <AvatarGroup sx={{ float: 'left' }} max={1000}>
                                                    {
                                                        members.map(({ ghUserName, avatarUrl }) => <Avatar sx={{ width: 24, height: 24 }} alt={ghUserName} src={avatarUrl} />)
                                                    }
                                                </AvatarGroup>
                                            </div>
                                        </>
                                    }
                                />
                                &nbsp;&nbsp;&nbsp;
                                <IconButton aria-label="delete" edge="end">
                                    <GitHubIcon
                                        onClick={() => window.open(teamsUrl, '_blank')}
                                    />
                                </IconButton>
                            </ListItemButton>
                        </ListItem>
                    )
                })
            }
        </List>
    )
}

export const TeamDetails = ({ team, teams, users, onTeamClick }: { team?: UITeam, teams: UITeams, users: UIUsers, onTeamClick: (team: string) => void }) => {
    const [learnMore, setLearnMore] = useState(false)
    const [seeUserDetails, setSeeUserDetails] = useState('')

    const handleLearnMoreClick = () => setLearnMore(!learnMore)
    const handleCloseMoreClick = () => setLearnMore(false)

    const handleCloseUserTails = () => setSeeUserDetails('')

    if (!team) {
        return <div>👇🏻 Select team below to get started</div>
    }

    const { name, avatarUrl, teamsUrl, LastCommit, Dep, members } = team
    
    const codecrewMembers = members.filter(({ ghUserName }) => users[ghUserName] !== undefined)
    const nonCodecrewMembers = members.filter(({ ghUserName }) => users[ghUserName] === undefined)

    return (
        <>
            { seeUserDetails !== '' && <UserDetailsDialog ghUserName={seeUserDetails} users={users} teams={teams} onClose={handleCloseUserTails} onTeamClick={(teamName) => { handleCloseUserTails(); onTeamClick(teamName) }} /> }
            <Card>
                <CardHeader
                    avatar={<Avatar alt={teamsUrl} src={avatarUrl} />}
                    title={ name }
                    subheader={`${new Date(LastCommit).toDateString()} (last commit)`}
                />
                <CardContent>
                    <Typography variant='h6'>Members</Typography>
                    { codecrewMembers.length === 0 && <Typography variant='overline'>No codecrew profile found</Typography> }
                    {
                        codecrewMembers.map(({ ghUserName }) => (
                            <div style={{ marginBottom: 15 }}>
                                <TeamMemberCard user={users[ghUserName]} onOpenUserDetails={(ghUserName) => setSeeUserDetails(ghUserName)} />
                            </div>
                        ))
                    }

                    { nonCodecrewMembers.length > 0 && (
                        <>
                            <Typography variant='h6'>Members without codecrew profile</Typography>
                            {
                                nonCodecrewMembers.map(({ ghUserName, avatarUrl }) => {
                                    const userData = users[ghUserName]
                                    if (userData) { return null }
            
                                    return <GithubAvatar ghUserName={ghUserName} avatarUrl={avatarUrl} />
                                })
                            }   
                        </>
                    )}
                    <div style={{ marginTop: 15 }}>
                        <Button size="small" variant="outlined" onClick={handleLearnMoreClick}>
                            Why no profiles?
                        </Button>
                    </div>
                    
                    <Dialog
                        open={learnMore}
                        onClose={handleCloseMoreClick}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                    >
                        <DialogTitle id="alert-dialog-title">
                            {"Why are some codecrew profiles missing?"}
                        </DialogTitle>
                        <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            codecrew profiles are automatically created from the commit history in your Github org. We also use the Github API to query members & SSO identities in your org.
                            <br/><br/>
                            We try our best to connect every commit message to a Github profile, but unfortunately there's no clear mapping.
                            <br/><br/>
                            Email and username are arbitrary in commit messages (not enforced or validated by Github) - that's why we sometimes can't find any commits for a given user and don't create a codecrew profile for them.
                        </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                        <Button onClick={handleCloseMoreClick} autoFocus>
                            Okay
                        </Button>
                        </DialogActions>
                    </Dialog>
                    
                    <DependencyList deps={Dep} />
                    <Divider sx={{ marginTop: 3 }} />
                    <div>
                        <Button startIcon={<GitHubIcon/>} onClick={() => window.open(teamsUrl, '_blank')}>
                            {name}
                        </Button>
                    </div>
                    <Divider sx={{ marginTop: 15 }} />
                </CardContent>
            </Card>
        </>
    )
}

export const DependencyList = ({ deps }: { deps: {[parserName: string]: {[dep: string]: number}} } ) => {
    if (getDepCount(deps) === 0) {
        return null
    }

    return (
        <>
            <Typography variant='h6'>Dependencies</Typography>
            <Typography variant='subtitle2'>NPM</Typography>
            {
                Object
                    .entries(deps.EcmaScript)
                    .sort(([, lineCountsA], [, lineCountsB]) => lineCountsB - lineCountsA)
                    .filter(([,lineCount]) => lineCount >= MIN_LINECOUNT)
                    .map(([dep, lineCount]) => (
                        <div>
                            <Chip size='small' style={{ margin: 3 }} label={`(${kNum(lineCount)}) ${dep}`} component="a" href={`https://www.npmjs.com/package/${getNpmPackage(dep)}`} target="_blank" clickable />
                        </div>
                    ))
            }
        </>
    )
}

export const SkllsLabel = ({ ext }: { ext: {[ext: string]: number }}) => (
    <>
        {
            filterSortExt(ext, 5).length === 0
            ? <Typography variant='overline'>No sklls found</Typography>
            : (
                filterSortExt(ext, 5).map(([ext, lineCount]) => (
                    <>
                        <img style={{ position: 'relative', height: 20, }}
                            src={getVSIFileIcon(ext)}
                            alt="js"
                        />
                        <span style={{ fontSize: 14, position: 'relative', bottom: 6, marginLeft: 3, marginRight: 6 }}>{`${ext.substring(1)} (${kNum(lineCount)})`}</span>
                    </>
                ))
            )
        }
    </>
)

export const TeamLinks = ({ teams, onClick }: { teams: UITeams, onClick: (teamName: string) => void }) => (
    <>
        {
            teams.map(({ name }) => <Chip size="small" icon={<GroupIcon/>} style={{ margin: 3 }} label={name} onClick={(event) => { onClick(name); event.stopPropagation(); }} />)
        }
    </>
)

export const DepsFilter = ({ dep }: { dep: {[parserName: string]: {[dep: string]: number}} }) => (
    <>
        <Typography>Dependencies</Typography>
        {
                Object
                    .entries(dep.EcmaScript)
                    .sort(([, lineCountsA], [, lineCountsB]) => lineCountsB - lineCountsA)
                    .filter(([,lineCount]) => lineCount >= MIN_LINECOUNT)
                    .map(([dep, lineCount]) => (
                        <div>
                            <Chip size='small' style={{ margin: 3 }} label={`(${kNum(lineCount)}) ${dep}`} component="a" href={`https://www.npmjs.com/package/${getNpmPackage(dep)}`} target="_blank" clickable />
                        </div>
                    ))
        }
    </>
)

export const ExtFilter = ({ ext, selected }: { ext: ExtCount[], selected: string[] }) => (
    <div style={{ textAlign: 'center', padding: 15 }}>
        { ext
            .sort(({ profileCount: a }, { profileCount: b }) => b - a)
            .filter(({ ext }) => supportsFileExt(ext))
            .map(({ ext, profileCount }) => (
                <Chip
                    avatar={ <img alt={ext} style={{ position: 'relative', height: 20, left: 3 }} src={getVSIFileIcon(ext)}/> }
                    size='small'
                    style={{ margin: 3 }}
                    label={`${ext.substring(1)} (${profileCount})`}
                    color={ selected.includes(ext) ? 'secondary' : 'default' }
                    variant={ selected.includes(ext) ? 'filled' : 'outlined' }
                    clickable
                />
            ))
        }
    </div>
)

export const Navbar = ({ items, value, onChange }: { items: string[], value: string, onChange: (newValue: string) => void }) => (
    <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
        <Tabs
            value={value}
            indicatorColor="primary"
            textColor="primary"
            onChange={(e: any, newTab: string) => onChange(newTab)}
            centered
        >
            {
                items.map(item => <Tab key={item} value={item} label={item} />)
            }
        </Tabs>
    </Box>
)

export const NPM_DISPLAY_SUFFIX = ' (npm)'

type AutocompleteItem = {
    label: string,
    displayLabel: string,
}

export const ExtDepFilter = ({ userExt, userDeps, onFilterChange }: { userExt: ExtCount[], userDeps: DepCount[], onFilterChange: (filters: string[]) => void }) => (
    <Autocomplete
        multiple
        id="tags-filled"
        onChange={(e, values) => onFilterChange(values.map(({ label }) => label))}
        options={[...userExt.map(({ ext }) => ({ label: ext, displayLabel: ext })), ...userDeps.map(({ dep }) => ({ label: dep, displayLabel: `${getNpmPackage(dep)} (npm)` }))]}
        defaultValue={[]}
        renderTags={(value: readonly AutocompleteItem[], getTagProps) =>
            value.map((option: AutocompleteItem, index: number) => (
                <span style={{ marginTop: 5, marginBottom: 5 }}>
                    <Chip icon={(supportsFileExt(option.label) ? <img alt={option.label} style={{ position: 'relative', height: 20, }} src={getVSIFileIcon(option.label)} /> : undefined)} variant="filled" label={option.displayLabel} {...getTagProps({ index })} />
                </span>
            ))
        }
        renderInput={(params) => (
            <TextField
                {...params}
                variant="filled"
                label={<><SearchRoundedIcon/><span style={{ position: 'relative', marginLeft: 6, bottom: 6, width: '100%' }}>Filter by Extension & Dependency</span></>}
                placeholder="Enter ext or dependency (e.g. 'ts' or 'react')"
            />
        )}
        renderOption={(props, option) => (
            <li {...props}>{option.displayLabel}</li>
        )}
        isOptionEqualToValue={(option: AutocompleteItem, value: AutocompleteItem) => option.label === value.label}
      />
)

export function CodeCrewButton() {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
      setAnchorEl(null);
    };

    const handleGithubClick = () => { handleClose(); window.open('https://github.com/spring-media/codecrew', '_blank') }
    const handleEmailClick = () => { handleClose(); window.open('mailto:jonas.peeck@axelspringer.com?subject=%5Bcodecrew%5D%20Question%20%2F%20Feedback%20%2F%20Comment', '_blank') }
    const handleContributeClick = () => { handleClose(); window.open('https://github.com/spring-media/codecrew#get-involved', '_blank') }
  
    return (
      <div>
        <Button
          id="basic-button"
          aria-controls={open ? 'basic-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          variant='text'
          startIcon={<CampaignIcon/>}
          onClick={handleClick}
        >
          codecrew
        </Button>
        <Menu
          id="basic-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            'aria-labelledby': 'basic-button',
          }}
        >
          <MenuItem onClick={handleGithubClick}>
            <GitHubIcon/> &nbsp; codecrew on Github
          </MenuItem>
          <MenuItem onClick={handleEmailClick}>
            <MailIcon/> &nbsp; Questions / Feedback / Comments? [jonas.peeck@axelspringer.com]
          </MenuItem>
          <MenuItem onClick={handleContributeClick}>
            <AutoFixHighIcon/> &nbsp; Contribute to codecrew
          </MenuItem>
        </Menu>
      </div>
    );
  }

/*
    UTILITY FUNCTIONS
 */
export function getTeamsForUsername (ghUserName: string, teams: UITeams): UITeams {
    return teams.filter(({ members }) => {
        for (const member of members) {
            if (member.ghUserName === ghUserName) {
                return true
            }
        }
        
        return false
    }).sort() as UITeams
}

export const MIN_LINECOUNT = 50

// Sorts ext by line-count and only returns the first maxExt
export function filterSortExt (ext: { [ext: string]: number }, maxExt: number): [string, number][] {
    return Object
            .entries(ext)
            .sort(([, lineCountsA], [, lineCountsB]) => lineCountsB - lineCountsA)
            .filter(([ext]) => supportsFileExt(ext))
            .filter(([,lineCount]) => lineCount >= MIN_LINECOUNT)
}

export function getDepCount (dep: {[parserName: string]: {[dep: string]: number}}): number {
    let count = 0
    Object
        .entries(dep)
        .forEach(([parserName, deps]) => {
            Object
                .entries(deps)
                .filter(([,lineCount]) => lineCount >= MIN_LINECOUNT)
                .forEach((dep) => count += 1)
            
        })
    return count
}

const kNum = (num: number) => num < 1000 ? `${num}` : `${(num - (num % 1000)) / 1000}k`

const getNpmPackage = (depStr: string): string => {
    if (depStr.startsWith('@')) {
        return `@${depStr.split('@')[1]}`
    }

    return depStr.split('@')[0]
}

export type ExtCount = {
    ext: string,
    overallLineCount: number,
    profileCount: number,
}
export function getAllUserExtensions (users: UIUsers): ExtCount[] {
    const exts = {} as {[ext: string]: ExtCount}
    Object
        .entries(users)
        .forEach(([, sklls]) => {
            Object
                .entries(sklls.Ext || {})
                .filter(([ext]) => supportsFileExt(ext))
                .filter(([,lineCount]) => lineCount >= MIN_LINECOUNT)
                .forEach(([extName, lineCount]) => {
                    if (!exts[extName]) {
                        exts[extName] = {
                            ext: extName,
                            overallLineCount: 0,
                            profileCount: 0,
                        }
                    }

                    exts[extName].profileCount += 1
                    exts[extName].overallLineCount += lineCount
                })
        })

    return Object.values(exts)
}

export type DepCount = {
    dep: string,
    overallLineCount: number,
    profileCount: number,
}
export function getAllUserDependencies (users: UIUsers): DepCount[] {
    const deps = {} as {[dep: string]: DepCount}
    Object
        .entries(users)
        .forEach(([, sklls]) => {
            Object
                .entries(sklls.Dep || {})
                .forEach(([parserName, dependencies]) => {
                    Object
                        .entries(dependencies)
                        .filter(([,lineCount]) => lineCount >= MIN_LINECOUNT)
                        .forEach(([depName, lineCount]) => {
                            if (!deps[depName]) {
                                deps[depName] = {
                                    dep: depName,
                                    overallLineCount: 0,
                                    profileCount: 0,
                                }
                            }

                            deps[depName].profileCount += 1
                            deps[depName].overallLineCount += lineCount
                        })

                })
        })

    return Object.values(deps)
}

export function filterUsersByExtDep (users: UIUsers, extAndDepFilter: string[]): UIUsers {
    if (extAndDepFilter.length === 0) {
        return users
    }

    return Object.fromEntries(
        Object
            .entries(users)
            .filter(([userName, user]) => {
                let filterValues = [...extAndDepFilter.map(depOrEx => getNpmPackage(depOrEx))]

                // Go through extensions
                Object
                    .entries(user.Ext || {})
                    .filter(([ext]) => supportsFileExt(ext))
                    .filter(([,lineCount]) => lineCount >= MIN_LINECOUNT)
                    .forEach(([extName, lineCount]) => {
                        if (filterValues.includes(extName)) {
                            filterValues.splice(filterValues.indexOf(extName), 1)
                        }
                    })

                // Go through dependencies
                Object
                    .entries(user.Dep || {})
                    .forEach(([parserName, dependencies]) => {
                        Object
                            .entries(dependencies)
                            .filter(([,lineCount]) => lineCount >= MIN_LINECOUNT)
                            .forEach(([depNameRaw, lineCount]) => {
                                const depName = getNpmPackage(depNameRaw)
                                if (filterValues.includes(depName)) {
                                    filterValues.splice(filterValues.indexOf(depName), 1)
                                }
                            })
                    })

                const matchesAllFilter = filterValues.length === 0
                if (matchesAllFilter) {
                    console.log(`${user.name || user.ghUserName} matches all filter: `, extAndDepFilter)
                }
                return matchesAllFilter
            })
    ) as UIUsers
}

export function filterTeamsByExtDep (teams: UITeams, extAndDepFilter: string[]): UITeams {
    if (extAndDepFilter.length === 0) {
        return teams
    }

    return teams.filter(team => {
        let filterValues = [...extAndDepFilter.map(depOrEx => getNpmPackage(depOrEx))]

        // Go through extensions
        Object
            .entries(team.Ext || {})
            .filter(([ext]) => supportsFileExt(ext))
            .filter(([,lineCount]) => lineCount >= MIN_LINECOUNT)
            .forEach(([extName, lineCount]) => {
                if (filterValues.includes(extName)) {
                    filterValues.splice(filterValues.indexOf(extName), 1)
                }
            })

        // Go through dependencies
        Object
            .entries(team.Dep || {})
            .forEach(([parserName, dependencies]) => {
                Object
                    .entries(dependencies)
                    .filter(([,lineCount]) => lineCount >= MIN_LINECOUNT)
                    .forEach(([depNameRaw, lineCount]) => {
                        const depName = getNpmPackage(depNameRaw)
                        if (filterValues.includes(depName)) {
                            filterValues.splice(filterValues.indexOf(depName), 1)
                        }
                    })
            })

        const matchesAllFilter = filterValues.length === 0
        if (matchesAllFilter) {
            console.log(`Team ${team.name} matches all filter: `, extAndDepFilter)
        }
        return matchesAllFilter
    })
}