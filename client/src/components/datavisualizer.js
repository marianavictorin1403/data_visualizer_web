import React, {useState, useEffect, useRef} from 'react';
import {getAuth, signOut} from 'firebase/auth';
import axios from 'axios';
import html2canvas from 'html2canvas';
import IndiaSVGPaths from '../assets/IndiaSVGPaths.json';
import avatar from '../images/avatar.png';
import '../assets/fonts/poppins.css';
import {
  AppBar,
  Box,
  Avatar,
  FormControlLabel,
  Checkbox,
  Toolbar,
  Tooltip,
  Typography,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  Button,
  Paper,
  Tabs,
  Tab,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/Share';

const DataVisualizer = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [countries, setCountries] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [sources, setSources] = useState([]);
  const [csvData, setCsvData] = useState([]);
  const [mapData, setMapData] = useState({});
  const [selectedSourceName, setSelectedSourceName] = useState('');
  const [selectedSourceUrl, setSelectedSourceUrl] = useState('');
  const [baseColor, setBaseColor] = useState('#4169E1');
  const [selectedCountryId, setSelectedCountryId] = useState('');
  const [selectedSectorId, setSelectedSectorId] = useState('');
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [selectedField, setSelectedField] = useState('');
  const [minVal, setMinVal] = useState(0);
  const [maxVal, setMaxVal] = useState(0);
  const mapRef = useRef(null);
  const [tooltip, setTooltip] = useState({
    show: false,
    x: 0,
    y: 0,
    content: '',
  });
  const tabStyle = {
    minHeight: 0,
    mr: 4,
    color: '#111827',
    fontWeight: 500,
    fontSize: 16,
    fontFamily: 'Poppins',
    textTransform: 'none',
    whiteSpace: 'nowrap',
  };

  useEffect(() => {
    axios
      .get('http://localhost:5050/country')
      .then(res => setCountries(res.data));
  }, []);

  useEffect(() => {
    if (selectedCountryId) {
      axios
        .get(`http://localhost:5050/sector/by-country/${selectedCountryId}`)
        .then(res => setSectors(res.data));
    }
  }, [selectedCountryId]);

  useEffect(() => {
    if (selectedSectorId && selectedCountryId) {
      axios
        .get(
          `http://localhost:5050/source/by-sector-country/${selectedSectorId}/${selectedCountryId}`
        )
        .then(res => setSources(res.data));
    }
  }, [selectedSectorId, selectedCountryId]);

  useEffect(() => {
    if (selectedField && csvData.length) {
      const data = {};
      const values = [];

      csvData.forEach(row => {
        const state = row.StateName?.trim();
        const value = parseFloat(row[selectedField]);
        if (state && !isNaN(value)) {
          data[state] = value;
          values.push(value);
        }
      });

      setMapData(data);
      setMinVal(Math.min(...values));
      setMaxVal(Math.max(...values));
    }
  }, [selectedField, csvData]);

  const fetchCSVFromGoogleSheet = async url => {
    const match = url.match(/\/d\/([\w-]+)/);
    if (!match) throw new Error('Invalid Google Sheets URL');
    const res = await axios.get(
      `https://docs.google.com/spreadsheets/d/${match[1]}/gviz/tq?tqx=out:csv`
    );
    return res.data;
  };

  const getColor = value => {
    if (isNaN(value)) return '#ccc';
    const ratio = (value - minVal) / (maxVal - minVal);
    const hex = baseColor.replace('#', '');
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);

    const blendedR = Math.round(255 - (255 - r) * ratio);
    const blendedG = Math.round(255 - (255 - g) * ratio);
    const blendedB = Math.round(255 - (255 - b) * ratio);

    return `rgb(${blendedR}, ${blendedG}, ${blendedB})`;
  };

  function splitCamelCase(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  const handleSourceChange = async e => {
    const url = e.target.value;
    const option = sources.find(s => s.link_url === url);
    if (!option) return;
    setSelectedSourceName(option.name);

    try {
      const csv = await fetchCSVFromGoogleSheet(url);

      const rows = csv.trim().split('\n');
      const headers = rows[0]
        .split(',')
        .map(h => h.replace(/^"|"$/g, '').trim());
      const excludeFields = [
        'statename',
        'yearcode',
        'statecode',
        'schooltype',
        'year',
        'country',
      ];

      const filtered = headers.filter(
        h => !excludeFields.includes(h.toLowerCase())
      );
      setCsvHeaders(filtered);
      setSelectedField(filtered[0]);

      const parsed = rows.slice(1).map(row => {
        const values = row
          .split(',')
          .map(val => val.replace(/^"|"$/g, '').trim());
        return headers.reduce((acc, h, i) => ({...acc, [h]: values[i]}), {});
      });

      setCsvData(parsed);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownload = async () => {
    if (!mapRef.current) return;

    const canvas = await html2canvas(mapRef.current, {
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#fff',
      scale: 2,
    });

    const link = document.createElement('a');
    link.download = 'map.jpg';
    link.href = canvas.toDataURL('image/jpeg', 1.0);
    link.click();
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#F7FAFC',
        padding: {xs: '16px', md: '30px'},
        boxSizing: 'border-box',
      }}
    >
      <AppBar
        position='static'
        color='default'
        elevation={0}
        sx={{
          width: '100%',
          minHeight: '100vh',
          margin: '0 auto',
          borderBottom: '1px solid #e0e0e0',
          boxSizing: 'border-box',
          paddingTop: {xs: '0px', md: '-0px'},
          paddingLeft: {xs: '16px', md: '40px'},
          paddingRight: {xs: '16px', md: '40px'},
          backgroundColor: '#F7FAFC',
        }}
      >
        <Toolbar
          sx={{
            gap: {xs: 0, md: 1},
            minHeight: {xs: '64px', md: '80px'},
            px: {xs: '12px', md: '20px'},
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'nowrap',
              width: '100%',
            }}
          >
            <Typography
              variant='h1'
              sx={{
                color: '#111827',
                fontWeight: 600,
                fontSize: {xs: '20px', sm: '24px', md: '28px'},
                fontFamily: 'Poppins',
                whiteSpace: 'nowrap',
                letterSpacing: '-3%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                verticalAlign: 'middle',
                flexShrink: 0,
                pr: 2,
              }}
            >
              Data Visualizer
            </Typography>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              textColor='#111827'
              indicatorColor='primary' // keep this to allow indicator rendering
              variant='scrollable'
              scrollButtons='auto'
              TabIndicatorProps={{
                style: {
                  backgroundColor: '#111827',
                  height: '3px', // optional: thickness of the line
                  borderRadius: '2px', // optional: rounded line
                },
              }}
              sx={{
                minHeight: 0,
                flexGrow: 1,
                '& .MuiTabs-flexContainer': {
                  gap: 1,
                  flexWrap: 'nowrap',
                },
              }}
            >
              <Tab label='Data Library' sx={tabStyle} />
              <Tab label='Data Workbench' sx={tabStyle} />
              <Tab label='Data Flow+' sx={tabStyle} />
              <Tab label='AI-Dataset Summarizer' sx={tabStyle} />
            </Tabs>
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: {xs: 1, md: 2}, // responsive horizontal gap
              px: {xs: 1, md: 2}, // padding left & right
              width: '100%',
              maxWidth: '100%',
              ml: 'auto',
              flexWrap: 'wrap', // prevents overflow on smaller screens
              justifyContent: 'flex-end', // ensures elements are right-aligned
            }}
          >
            <Avatar
              src={avatar}
              alt='User Avatar'
              sx={{
                width: {xs: 36, sm: 42, md: 48},
                height: {xs: 36, sm: 42, md: 46},
                bgcolor: '#fff',
                p: 0.1,
                ml: {xs: 1, sm: 2, md: 1},
                mr: {xs: 1, sm: 2, md: -2},
              }}
            />

            <Button
              onClick={() =>
                signOut(getAuth()).then(() => (window.location.href = '/'))
              }
              variant='outlined'
              sx={{
                textTransform: 'none',
                backgroundColor: '#FFFFFF',
                borderColor: 'white',
                borderRadius: '12px',
                fontSize: {xs: 14, sm: 15, md: 16},
                fontWeight: 500,
                color: '#111827',
                height: {xs: 44, sm: 48, md: 54},
                fontFamily: 'Poppins',
                px: {xs: 2, sm: 2.5, md: 4},
                ml: {xs: 2, sm: 3, md: 4}, // 👈 Increased left margin
                whiteSpace: 'nowrap',
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                  borderColor: '#ccc',
                },
                mr: {xs: 1, sm: 2, md: -4},
              }}
              endIcon={<span style={{fontSize: '1.2rem'}}>{'>'}</span>}
            >
              Sign Out
            </Button>
          </Box>
        </Toolbar>
        {}
        {activeTab === 0 && (
          <Box
            sx={{
              width: '1800px',
              maxWidth: '5000px',
              height: {xs: '1600px', md: '3000px'}, // fixed height
              margin: '0 auto',
              paddingTop: {xs: '8px', md: '10px'},
              paddingLeft: {xs: '10px', md: '1px'},
              paddingRight: {xs: '1px', md: '42px'},
              overflowX: 'auto',
              position: 'relative',
              boxSizing: 'border-box',
            }}
          >
            <Paper
              elevation={3}
              sx={{
                width: '100%',
                maxWidth: '2000px', // keeps original width on large screens
                minHeight: '1900px', // retains original vertical space
                padding: {xs: '24px', md: '40px'}, // adjusts padding for smaller screens
                borderRadius: '16px',
                display: 'flex',
                flexDirection: {xs: 'column', md: 'row'}, // stack on small screens
                gap: {xs: '32px', md: '60px'},
                alignItems: 'flex-start',
                backgroundColor: '#fff',
                boxSizing: 'border-box',
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  height: {xs: '1760px', md: '3000px'}, // fixed height
                  maxWidth: '500px', // limit width to original on large screens
                  minWidth: {xs: '100%', sm: 'auto'}, // allow full width on small screens
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  flexShrink: 0, // prevents shrinking in flex layout
                  boxSizing: 'border-box',
                }}
              >
                <Typography
                  variant='h6'
                  sx={{
                    mb: {xs: '24px', md: '32px'}, // slightly less margin on small screens
                    fontWeight: 100,
                    fontSize: {xs: '20px', md: '24px'}, // scale down font on smaller screens
                    fontFamily: 'Poppins, sans-serif',
                    color: '#333333',
                    lineHeight: 1.2,
                    textAlign: {xs: 'center', md: 'left'}, // optional: center on mobile
                  }}
                >
                  Visualize from Data Library
                </Typography>
                <Typography
                  variant='subtitle1'
                  sx={{
                    mt: {xs: '2px', sm: '3px', md: '4px'}, // light top margin tuning
                    mb: {xs: '6px', sm: '7px', md: '12px'}, // consistent visual spacing
                    fontWeight: 500,
                    fontSize: {xs: '14px', sm: '15px', md: '16px'}, // scale font slightly on small screens
                    fontFamily: 'Poppins, sans-serif',
                    color: '#333333',
                    lineHeight: 1.4,
                    textAlign: {xs: 'center', sm: 'left'}, // optional: center for mobile
                  }}
                >
                  Select your Map
                </Typography>
                <FormControl
                  sx={{
                    mb: {xs: '16px', sm: '20px', md: '24px'}, // margin bottom adjusts by screen size
                    width: {xs: '100%', sm: '360px', md: '400px'}, // responsive width
                    backgroundColor: '#F7FAFC',
                    borderRadius: '8px',
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      fontSize: {xs: '14px', sm: '15px', md: '16px'},
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 400,
                    },
                  }}
                >
                  <Select
                    value={selectedCountryId}
                    displayEmpty
                    onChange={e => setSelectedCountryId(e.target.value)}
                    sx={{
                      height: {xs: '44px', sm: '46px', md: '48px'}, // scales height slightly for smaller screens
                      px: {xs: 1.5, sm: 2, md: 3}, // horizontal padding
                      fontSize: {xs: '14px', sm: '15px', md: '16px'},
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 400,
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          fontFamily: 'Poppins, sans-serif',
                        },
                      },
                    }}
                  >
                    {!selectedCountryId && (
                      <MenuItem disabled value=''>
                        Select a country
                      </MenuItem>
                    )}
                    {countries.map(c => (
                      <MenuItem
                        key={c._id}
                        value={c._id}
                        sx={{
                          fontFamily: 'Poppins, sans-serif',
                          fontSize: '16px',
                        }}
                      >
                        {c.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Typography
                  variant='subtitle1'
                  sx={{
                    fontWeight: 500,
                    fontSize: {xs: '14px', sm: '15px', md: '16px'}, // scales down on smaller devices
                    fontFamily: 'Poppins, sans-serif',
                    color: '#333',
                    mt: {xs: 0.5, sm: 0},
                    mb: {xs: 0.5, sm: 1},
                  }}
                >
                  Select your Dataset
                </Typography>

                <FormControl
                  sx={{
                    width: {xs: '100%', sm: '100%', md: '400px'}, // full width on small devices, fixed on medium+
                    mb: {xs: 2, md: '24px'}, // tighter spacing on mobile
                    backgroundColor: '#F7FAFC',
                    borderRadius: '12px',
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                    },
                  }}
                >
                  <Select
                    value={selectedSectorId}
                    displayEmpty
                    onChange={e => {
                      setSelectedSectorId(e.target.value);
                      setSelectedSourceUrl('');
                      setSelectedSourceName('');
                      setSelectedField('');
                      setCsvHeaders([]);
                      setCsvData([]);
                      setMapData({});
                    }}
                    sx={{
                      height: {xs: 44, sm: 46, md: 48}, // gradually scaled height
                      px: {xs: 1.5, sm: 2, md: 3}, // responsive horizontal padding
                      fontSize: {xs: '14px', sm: '15px', md: '16px'}, // adapt font size to screen size
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 400,
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          fontFamily: 'Poppins, sans-serif',
                        },
                      },
                    }}
                  >
                    {!selectedSectorId && (
                      <MenuItem disabled value=''>
                        Select a sector
                      </MenuItem>
                    )}
                    {sectors.map(s => (
                      <MenuItem
                        key={s._id}
                        value={s._id}
                        sx={{
                          fontFamily: 'Poppins, sans-serif',
                          fontSize: '16px',
                        }}
                      >
                        {s.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Typography
                  variant='subtitle1'
                  sx={{
                    fontWeight: 500,
                    fontSize: {xs: '14px', sm: '15px', md: '16px'}, // adjusts for smaller screens
                    fontFamily: 'Poppins, sans-serif',
                    color: '#333',
                    mt: {xs: 0.5, sm: 0, md: 0}, // adjusts top margin
                    mb: {xs: 0.5, sm: 1, md: 1}, // adjusts bottom margin
                  }}
                >
                  Select your source
                </Typography>

                <FormControl
                  sx={{
                    width: {xs: '100%', sm: '100%', md: '400px'}, // full width on small screens, fixed on desktop
                    mb: {xs: '16px', sm: '20px', md: '24px'}, // adjusted bottom margin
                    backgroundColor: '#F7FAFC',
                    borderRadius: '12px',
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    },
                  }}
                >
                  <Select
                    value={selectedSourceUrl}
                    displayEmpty
                    onChange={e => {
                      const url = e.target.value;
                      const selected = sources.find(s => s.link_url === url);
                      if (selected) {
                        setSelectedSourceUrl(url);
                        setSelectedSourceName(selected.name);
                        handleSourceChange({target: {value: url}});
                      }
                    }}
                    sx={{
                      height: {xs: '44px', sm: '46px', md: '48px'}, // consistent size on different screens
                      px: {xs: 1.5, sm: 2, md: 3}, // responsive horizontal padding
                      fontSize: {xs: '14px', sm: '15px', md: '16px'},
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 400,
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          fontFamily: 'Poppins, sans-serif',
                        },
                      },
                    }}
                  >
                    {!selectedSourceUrl && (
                      <MenuItem disabled value=''>
                        Select a source
                      </MenuItem>
                    )}
                    {sources.map(src => (
                      <MenuItem
                        key={src._id}
                        value={src.link_url}
                        sx={{
                          fontFamily: 'Poppins, sans-serif',
                          fontSize: '16px',
                        }}
                      >
                        {src.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {csvHeaders.length > 0 && (
                  <Box sx={{width: '400px', mt: 0}}>
                    <Typography
                      variant='subtitle1'
                      sx={{
                        fontWeight: 500,
                        fontSize: {xs: '14px', sm: '15px', md: '16px'}, // scales across breakpoints
                        fontFamily: 'Poppins, sans-serif',
                        color: '#333',
                        mb: {xs: 0.5, sm: 0}, // slightly tighter margin on small screens
                      }}
                    >
                      Select a field to visualize
                    </Typography>

                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: {xs: 0.5, sm: 1}, // slightly tighter gap on smaller screens
                        maxHeight: {xs: '180px', sm: '200px'}, // adjusts height based on screen size
                        overflowY: 'auto',
                        backgroundColor: '#F7FAFC',
                        borderRadius: '12px',
                        pr: {xs: 0.5, sm: 1}, // responsive right padding
                        mt: {xs: 1, sm: 2}, // responsive top margin
                      }}
                    >
                      {csvHeaders.map((field, index) => (
                        <FormControlLabel
                          key={index}
                          control={
                            <Checkbox
                              checked={selectedField === field}
                              onChange={() => setSelectedField(field)}
                              name={field}
                              sx={{p: 1.0}}
                            />
                          }
                          label={
                            <Typography
                              sx={{
                                fontWeight: 400,
                                fontSize: '15px',
                                fontFamily: 'Poppins, sans-serif',
                              }}
                            >
                              {splitCamelCase(field)}
                            </Typography>
                          }
                          sx={{ml: 0}}
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                <Box sx={{mt: 3}}>
                  <Typography
                    variant='subtitle1'
                    sx={{
                      fontWeight: 500,
                      fontSize: {xs: '14px', sm: '15px', md: '16px'}, // Responsive font sizes
                      fontFamily: 'Poppins, sans-serif',
                      color: '#333',
                      mb: {xs: 1, sm: 1.5, md: 2}, // Responsive margin bottom
                    }}
                  >
                    Pick a custom color
                  </Typography>

                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: {xs: 1, sm: 2}, // smaller gap on small screens
                      flexWrap: 'wrap',
                      backgroundColor: '#F7FAFC',
                      p: {xs: 1.5, sm: 2}, // responsive padding
                      borderRadius: '12px',
                      width: {xs: '100%', sm: '400px'}, // full width on small screens, fixed on medium+
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: {xs: 0.5, sm: 1, md: 1}, // responsive spacing between items
                        mt: {xs: 0.5, sm: 1, md: 1}, // responsive top margin
                        flexWrap: 'wrap', // optional: prevents overflow on small screens
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: 'Poppins, sans-serif',
                          fontWeight: 500,
                          fontSize: {xs: '13px', sm: '14px', md: '14px'}, // responsive font size
                          color: '#333',
                          lineHeight: 1.4, // improves readability on small screens
                          whiteSpace: 'normal', // allows wrapping if needed
                        }}
                      >
                        Custom Color:
                      </Typography>
                      <input
                        type='color'
                        value={baseColor}
                        onChange={e => setBaseColor(e.target.value)}
                        style={{
                          width: '100%',
                          maxWidth: '48px',
                          minWidth: '36px',
                          height: 'auto',
                          aspectRatio: '1 / 1',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              </Box>
              <Box
                sx={{
                  flexGrow: 1,
                  position: 'relative',
                  mr: {xs: 0, sm: 1},
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: {xs: 'center', md: 'flex-start'},
                  width: '100%',
                  maxWidth: '100%',
                  overflow: 'hidden',
                }}
              >
                {/* Map Box */}
                <Box
                  sx={{
                    width: '100%',
                    maxWidth: '1100px',
                    height: {xs: '600px', sm: '700px', md: '800px'},
                    overflow: 'hidden',
                    borderRadius: '14px',
                    backgroundColor: '#F7FAFC',
                    boxShadow: 'inset 0 0 4px rgba(0,0,0,0.1)',
                    p: 1,
                    pr: {xs: 1, sm: 2, md: '30px'},
                    position: 'relative',
                    mx: 'auto', // centers horizontally
                  }}
                >
                  {/* Floating Icons Top-Right */}
                  {selectedSourceName && selectedField && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: {xs: 12, sm: 16, md: 16},
                        right: {xs: 12, sm: 16, md: 10},
                        display: 'flex',
                        gap: {xs: 0.5, sm: 1, md: 1},
                        zIndex: 10,
                      }}
                    >
                      <Tooltip title='Download'>
                        <IconButton
                          onClick={handleDownload}
                          sx={{
                            width: {xs: 32, sm: 36, md: 40},
                            height: {xs: 32, sm: 36, md: 40},
                            borderRadius: '50%',
                            backgroundColor: '#E8EDF2',
                            '&:hover': {
                              backgroundColor: '#E8EDF2',
                            },
                          }}
                        >
                          <DownloadIcon sx={{color: '#000'}} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title='Share'>
                        <IconButton
                          sx={{
                            width: {xs: 32, sm: 36, md: 40}, // Responsive width
                            height: {xs: 32, sm: 36, md: 40}, // Responsive height
                            borderRadius: '50%', // Keeps icon round
                            backgroundColor: '#E8EDF2',
                            '&:hover': {
                              backgroundColor: '#E8EDF2',
                            },
                          }}
                        >
                          <ShareIcon sx={{color: '#000'}} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}

                  {/* Title */}
                  {selectedSourceUrl && selectedSourceName && selectedField && (
                    <Typography
                      variant='h6'
                      align='center'
                      sx={{
                        mt: {xs: 1, sm: 2}, // Responsive top margin
                        mb: {xs: 2, sm: 3}, // Responsive bottom margin
                        fontWeight: 100,
                        fontSize: {xs: 18, sm: 20, md: 24}, // Responsive font size
                        fontFamily: 'Poppins, sans-serif',
                        textAlign: 'center', // Ensures center alignment on all screens
                        wordWrap: 'break-word', // Ensures clean wrapping on smaller screens
                      }}
                    >
                      India ({splitCamelCase(selectedSourceName)}) -{' '}
                      {splitCamelCase(selectedField)}
                    </Typography>
                  )}

                  {/* Message if no field is selected */}
                  {!selectedField ? (
                    <Box
                      sx={{
                        mt: {xs: 10, sm: 16, md: 20}, // Responsive top margin
                        textAlign: 'center',
                        fontFamily: 'Poppins, sans-serif',
                        color: '#F7FAFC',
                        fontSize: {xs: 14, sm: 16, md: 18}, // Responsive font size
                        px: {xs: 2, sm: 4}, // Optional: Add padding for smaller screens
                      }}
                    >
                      {selectedCountryId && sectors.length === 0
                        ? 'The selected country does not have any dataset.'
                        : selectedSectorId && sources.length === 0
                        ? 'The selected dataset does not have any source.'
                        : 'Please select a field to visualize the map.'}
                    </Box>
                  ) : (
                    <Box
                      ref={mapRef}
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '100%',
                        minHeight: {xs: '400px', sm: '600px', md: '800px'}, // Responsive height
                        borderRadius: '16px',
                        ml: {xs: 0, sm: '80px', md: '160px', lg: '240px'}, // Responsive left margin
                        mt: {xs: '20px', sm: '40px', md: '60px'}, // Responsive top margin
                      }}
                    >
                      <svg
                        viewBox='0 0 1000 1000'
                        width='1000'
                        height='1000'
                        style={{display: 'block'}}
                        strokeWidth={5}
                      >
                        {IndiaSVGPaths.features.map((feature, idx) => {
                          const stateName = feature.properties?.st_nm;
                          const value = mapData[stateName];
                          const color = getColor(value);
                          const {type, coordinates} = feature.geometry;
                          const polys =
                            type === 'Polygon' ? [coordinates] : coordinates;

                          return polys.map((polygon, polyIdx) => {
                            const points = polygon[0].map(([lon, lat]) => [
                              (lon - 68) * 20,
                              (38 - lat) * 20,
                            ]);
                            const d =
                              points
                                .map(
                                  ([x, y], i) =>
                                    `${i === 0 ? 'M' : 'L'} ${x},${y}`
                                )
                                .join(' ') + ' Z';

                            return (
                              <path
                                key={`path-${idx}-${polyIdx}`}
                                d={d}
                                fill={color}
                                stroke='#111'
                                strokeWidth={1.9}
                                onMouseEnter={() => {
                                  const centroid = points
                                    .reduce(
                                      (acc, [x, y]) => [acc[0] + x, acc[1] + y],
                                      [0, 0]
                                    )
                                    .map(v => v / points.length);
                                  setTooltip({
                                    show: true,
                                    x: centroid[0],
                                    y: centroid[1] - 10,
                                    content: `${stateName}: ${value ?? 'N/A'}`,
                                    stateName,
                                  });
                                }}
                                onMouseLeave={() =>
                                  setTooltip({...tooltip, show: false})
                                }
                              />
                            );
                          });
                        })}
                        {/* Tooltip */}
                        {tooltip.show && (
                          <text
                            x={tooltip.x}
                            y={tooltip.y}
                            textAnchor='middle'
                            fontSize='16'
                            fontFamily='sans-serif'
                            fill='#000'
                            stroke='#fff'
                            paintOrder='stroke fill'
                          >
                            {tooltip.content}
                          </text>
                        )}
                      </svg>
                    </Box>
                  )}
                </Box>
              </Box>
            </Paper>
          </Box>
        )}
         {activeTab === 1 && (
          <Box
            sx={{
              width: '1800px',
              maxWidth: '5000px',
              height: {xs: '1600px', md: '3000px'}, // fixed height
              margin: '0 auto',
              paddingTop: {xs: '8px', md: '10px'},
              paddingLeft: {xs: '10px', md: '1px'},
              paddingRight: {xs: '1px', md: '42px'},
              overflowX: 'auto',
              position: 'relative',
              boxSizing: 'border-box',
            }}
          >
            <Paper
              elevation={3}
              sx={{
                width: '100%',
                maxWidth: '2000px', // keeps original width on large screens
                minHeight: '1900px', // retains original vertical space
                padding: {xs: '24px', md: '40px'}, // adjusts padding for smaller screens
                borderRadius: '16px',
                display: 'flex',
                flexDirection: {xs: 'column', md: 'row'}, // stack on small screens
                gap: {xs: '32px', md: '60px'},
                alignItems: 'flex-start',
                backgroundColor: '#fff',
                boxSizing: 'border-box',
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  height: {xs: '1760px', md: '3000px'}, // fixed height
                  maxWidth: '500px', // limit width to original on large screens
                  minWidth: {xs: '100%', sm: 'auto'}, // allow full width on small screens
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  flexShrink: 0, // prevents shrinking in flex layout
                  boxSizing: 'border-box',
                }}
              >
                <Typography
                  variant='h6'
                  sx={{
                    mb: {xs: '24px', md: '32px'}, // slightly less margin on small screens
                    fontWeight: 600,
                    fontSize: {xs: '20px', md: '24px'}, // scale down font on smaller screens
                    fontFamily: 'Poppins, sans-serif',
                    color: '#333333',
                    lineHeight: 1.2,
                    textAlign: {xs: 'center', md: 'left'}, // optional: center on mobile
                  }}
                >
                  Visualize from your own data
                </Typography>
                 <Box
                      sx={{
                        position: 'absolute',
                        top: {xs: 12, sm: 16, md: 28},
                        right: {xs: 12, sm: 16, md: 70},
                        display: 'flex',
                        gap: {xs: 0.5, sm: 1, md: 1},
                        zIndex: 10,
                      }}
                    >
                      <Tooltip title='Download'>
                        <IconButton
                          onClick={handleDownload}
                          sx={{
                            width: {xs: 32, sm: 36, md: 40},
                            height: {xs: 32, sm: 36, md: 40},
                            borderRadius: '50%',
                            backgroundColor: '#E8EDF2',
                            '&:hover': {
                              backgroundColor: '#E8EDF2',
                            },
                          }}
                        >
                          <DownloadIcon sx={{color: '#000'}} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title='Share'>
                        <IconButton
                          sx={{
                            width: {xs: 32, sm: 36, md: 40}, // Responsive width
                            height: {xs: 32, sm: 36, md: 40}, // Responsive height
                            borderRadius: '50%', // Keeps icon round
                            backgroundColor: '#E8EDF2',
                            '&:hover': {
                              backgroundColor: '#E8EDF2',
                            },
                          }}
                        >
                          <ShareIcon sx={{color: '#000'}} />
                        </IconButton>
                      </Tooltip>
                    </Box>
              </Box> 
            </Paper>
          </Box>
          
        )}
         {activeTab === 2 && (
          <Box
            sx={{
              width: '1800px',
              maxWidth: '5000px',
              height: {xs: '1600px', md: '3000px'}, // fixed height
              margin: '0 auto',
              paddingTop: {xs: '8px', md: '10px'},
              paddingLeft: {xs: '10px', md: '1px'},
              paddingRight: {xs: '1px', md: '42px'},
              overflowX: 'auto',
              position: 'relative',
              boxSizing: 'border-box',
            }}
          >
            <Paper
              elevation={3}
              sx={{
                width: '100%',
                maxWidth: '2000px', // keeps original width on large screens
                minHeight: '1900px', // retains original vertical space
                padding: {xs: '24px', md: '40px'}, // adjusts padding for smaller screens
                borderRadius: '16px',
                display: 'flex',
                flexDirection: {xs: 'column', md: 'row'}, // stack on small screens
                gap: {xs: '32px', md: '60px'},
                alignItems: 'flex-start',
                backgroundColor: '#fff',
                boxSizing: 'border-box',
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  height: {xs: '1760px', md: '3000px'}, // fixed height
                  maxWidth: '500px', // limit width to original on large screens
                  minWidth: {xs: '100%', sm: 'auto'}, // allow full width on small screens
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  flexShrink: 0, // prevents shrinking in flex layout
                  boxSizing: 'border-box',
                }}
              >
                <Typography
                  variant='h6'
                  sx={{
                    mb: {xs: '24px', md: '32px'}, // slightly less margin on small screens
                    fontWeight: 600,
                    fontSize: {xs: '20px', md: '24px'}, // scale down font on smaller screens
                    fontFamily: 'Poppins, sans-serif',
                    color: '#333333',
                    lineHeight: 1.2,
                    textAlign: {xs: 'center', md: 'left'}, // optional: center on mobile
                  }}
                >
                  From Premium Institutions and Paid Datasets
                </Typography>
                 <Box
                      sx={{
                        position: 'absolute',
                        top: {xs: 12, sm: 16, md: 28},
                        right: {xs: 12, sm: 16, md: 70},
                        display: 'flex',
                        gap: {xs: 0.5, sm: 1, md: 1},
                        zIndex: 10,
                      }}
                    >
                      <Tooltip title='Download'>
                        <IconButton
                          onClick={handleDownload}
                          sx={{
                            width: {xs: 32, sm: 36, md: 40},
                            height: {xs: 32, sm: 36, md: 40},
                            borderRadius: '50%',
                            backgroundColor: '#E8EDF2',
                            '&:hover': {
                              backgroundColor: '#E8EDF2',
                            },
                          }}
                        >
                          <DownloadIcon sx={{color: '#000'}} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title='Share'>
                        <IconButton
                          sx={{
                            width: {xs: 32, sm: 36, md: 40}, // Responsive width
                            height: {xs: 32, sm: 36, md: 40}, // Responsive height
                            borderRadius: '50%', // Keeps icon round
                            backgroundColor: '#E8EDF2',
                            '&:hover': {
                              backgroundColor: '#E8EDF2',
                            },
                          }}
                        >
                          <ShareIcon sx={{color: '#000'}} />
                        </IconButton>
                      </Tooltip>
                    </Box>
              </Box> 
            </Paper>
          </Box>
          
        )}
         {activeTab === 3 && (
          <Box
            sx={{
              width: '1800px',
              maxWidth: '5000px',
              height: {xs: '1600px', md: '3000px'}, // fixed height
              margin: '0 auto',
              paddingTop: {xs: '8px', md: '10px'},
              paddingLeft: {xs: '10px', md: '1px'},
              paddingRight: {xs: '1px', md: '42px'},
              overflowX: 'auto',
              position: 'relative',
              boxSizing: 'border-box',
            }}
          >
            <Paper
              elevation={3}
              sx={{
                width: '100%',
                maxWidth: '2000px', // keeps original width on large screens
                minHeight: '1900px', // retains original vertical space
                padding: {xs: '24px', md: '40px'}, // adjusts padding for smaller screens
                borderRadius: '16px',
                display: 'flex',
                flexDirection: {xs: 'column', md: 'row'}, // stack on small screens
                gap: {xs: '32px', md: '60px'},
                alignItems: 'flex-start',
                backgroundColor: '#fff',
                boxSizing: 'border-box',
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  height: {xs: '1760px', md: '3000px'}, // fixed height
                  maxWidth: '500px', // limit width to original on large screens
                  minWidth: {xs: '100%', sm: 'auto'}, // allow full width on small screens
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  flexShrink: 0, // prevents shrinking in flex layout
                  boxSizing: 'border-box',
                }}
              >
                <Typography
                  variant='h6'
                  sx={{
                    mb: {xs: '24px', md: '32px'}, // slightly less margin on small screens
                    fontWeight: 600,
                    fontSize: {xs: '20px', md: '24px'}, // scale down font on smaller screens
                    fontFamily: 'Poppins, sans-serif',
                    color: '#333333',
                    lineHeight: 1.2,
                    textAlign: {xs: 'center', md: 'left'}, // optional: center on mobile
                  }}
                >
                  AI Dataset Summariser
                </Typography>
                 <Box
                      sx={{
                        position: 'absolute',
                        top: {xs: 12, sm: 16, md: 28},
                        right: {xs: 12, sm: 16, md: 70},
                        display: 'flex',
                        gap: {xs: 0.5, sm: 1, md: 1},
                        zIndex: 10,
                      }}
                    >
                      <Tooltip title='Download'>
                        <IconButton
                          onClick={handleDownload}
                          sx={{
                            width: {xs: 32, sm: 36, md: 40},
                            height: {xs: 32, sm: 36, md: 40},
                            borderRadius: '50%',
                            backgroundColor: '#E8EDF2',
                            '&:hover': {
                              backgroundColor: '#E8EDF2',
                            },
                          }}
                        >
                          <DownloadIcon sx={{color: '#000'}} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title='Share'>
                        <IconButton
                          sx={{
                            width: {xs: 32, sm: 36, md: 40}, // Responsive width
                            height: {xs: 32, sm: 36, md: 40}, // Responsive height
                            borderRadius: '50%', // Keeps icon round
                            backgroundColor: '#E8EDF2',
                            '&:hover': {
                              backgroundColor: '#E8EDF2',
                            },
                          }}
                        >
                          <ShareIcon sx={{color: '#000'}} />
                        </IconButton>
                      </Tooltip>
                    </Box>
              </Box> 
            </Paper>
          </Box>
          
        )}
      </AppBar>
    </Box>
  );
};

export default DataVisualizer;
