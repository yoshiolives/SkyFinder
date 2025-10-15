# Saved Places Feature - Implementation Guide

## Overview
Transform the sidebar from itinerary-based to a Google Maps "Saved" feature where users can:
1. Save places they click on the map
2. Create custom lists
3. Organize saved places into lists

## Implementation Steps

### 1. State Management
Add the following state variables:
```typescript
const [savedPlaces, setSavedPlaces] = useState<any[]>([]);
const [savedLists, setSavedLists] = useState<any[]>([]);
const [selectedList, setSelectedList] = useState<any | null>(null);
const [createListDialogOpen, setCreateListDialogOpen] = useState(false);
const [newListName, setNewListName] = useState('');
const [newListIcon, setNewListIcon] = useState('📌');
const [newListColor, setNewListColor] = useState('#4285F4');
const [saveToListDialogOpen, setSaveToListDialogOpen] = useState(false);
const [placeToSave, setPlaceToSave] = useState<any>(null);
```

### 2. API Functions
Add these functions to interact with the backend:

```typescript
// Fetch saved lists
const fetchSavedLists = async () => {
  try {
    const response = await api.get('/api/lists');
    setSavedLists(response.data.lists || []);
  } catch (error) {
    console.error('Error fetching saved lists:', error);
  }
};

// Fetch saved places
const fetchSavedPlaces = async () => {
  try {
    const response = await api.get('/api/lists/items');
    setSavedPlaces(response.data.items || []);
  } catch (error) {
    console.error('Error fetching saved places:', error);
  }
};

// Save place to list
const handleSavePlace = (place: any) => {
  setPlaceToSave(place);
  setSaveToListDialogOpen(true);
};

// Add to saved list
const handleAddToSavedList = async (listId: string) => {
  if (!placeToSave) return;
  try {
    await api.post(`/api/lists/${listId}/items`, placeToSave);
    setSaveToListDialogOpen(false);
    setPlaceToSave(null);
    fetchSavedPlaces();
  } catch (error: any) {
    if (error.response?.status === 409) {
      alert('This place is already in the list!');
    } else {
      console.error('Error adding to list:', error);
      alert('Failed to add to list. Please try again.');
    }
  }
};

// Create new list
const handleCreateList = async () => {
  if (!newListName.trim()) return;
  try {
    const response = await api.post('/api/lists', {
      name: newListName,
      icon: newListIcon,
      color: newListColor,
    });
    setSavedLists([...savedLists, response.data.list]);
    setCreateListDialogOpen(false);
    setNewListName('');
    setNewListIcon('📌');
    setNewListColor('#4285F4');
  } catch (error) {
    console.error('Error creating list:', error);
    alert('Failed to create list. Please try again.');
  }
};

// Delete list
const handleDeleteList = async (listId: string) => {
  if (!confirm('Are you sure you want to delete this list?')) return;
  try {
    await api.delete(`/api/lists/${listId}`);
    setSavedLists(savedLists.filter((list) => list.id !== listId));
    if (selectedList?.id === listId) {
      setSelectedList(null);
    }
  } catch (error) {
    console.error('Error deleting list:', error);
    alert('Failed to delete list. Please try again.');
  }
};

// Remove from list
const handleRemoveFromList = async (listId: string, itemId: string) => {
  try {
    await api.delete(`/api/lists/${listId}/items/${itemId}`);
    fetchSavedPlaces();
  } catch (error) {
    console.error('Error removing from list:', error);
    alert('Failed to remove from list. Please try again.');
  }
};
```

### 3. Update useEffect
Update the auth state listener to fetch saved lists:
```typescript
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      setUser(session.user);
      fetchSavedLists();
      fetchSavedPlaces();
    } else {
      setUser(null);
      setTrips([]);
      setCurrentTrip(null);
      setSavedLists([]);
      setSavedPlaces([]);
    }
    setLoading(false);
  });

  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session?.user) {
      setUser(session.user);
    }
    setLoading(false);
  });

  return () => subscription.unsubscribe();
}, []);
```

### 4. Sidebar UI
Replace the itinerary sidebar content with:

```typescript
{loading ? (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', p: 4 }}>
    <CircularProgress />
  </Box>
) : !user ? (
  <Box sx={{ p: 4, textAlign: 'center' }}>
    <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
      🗺️ Welcome!
    </Typography>
    <Typography variant="body2" color="text.secondary">
      Sign in to save places and create your own lists.
    </Typography>
  </Box>
) : selectedList ? (
  /* List Items View */
  <Box>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
      <IconButton size="small" onClick={() => setSelectedList(null)}>
        <ChevronLeftIcon />
      </IconButton>
      <Typography variant="h6" sx={{ flex: 1 }}>
        {selectedList.icon} {selectedList.name}
      </Typography>
      {!selectedList.is_default && (
        <IconButton size="small" onClick={() => handleDeleteList(selectedList.id)} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      )}
    </Box>

    {savedPlaces.filter((item) => item.list_id === selectedList.id).length === 0 ? (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No places saved yet
        </Typography>
      </Box>
    ) : (
      <List>
        {savedPlaces
          .filter((item) => item.list_id === selectedList.id)
          .map((item) => (
            <ListItem
              key={item.id}
              sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 1, '&:hover': { backgroundColor: 'action.hover' } }}
            >
              <ListItemIcon>
                <PlaceIcon sx={{ color: selectedList.color }} />
              </ListItemIcon>
              <ListItemText primary={item.name} secondary={item.address} />
              <IconButton size="small" onClick={() => handleRemoveFromList(selectedList.id, item.id)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </ListItem>
          ))}
      </List>
    )}
  </Box>
) : (
  /* Saved Lists View */
  <Box>
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
      <Typography variant="h6">Saved Lists</Typography>
      <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={() => setCreateListDialogOpen(true)}>
        New List
      </Button>
    </Box>

    {savedLists.length === 0 ? (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          No lists yet
        </Typography>
        <Button variant="outlined" size="small" onClick={() => setCreateListDialogOpen(true)}>
          Create Your First List
        </Button>
      </Box>
    ) : (
      <List>
        {savedLists.map((list) => (
          <ListItem
            key={list.id}
            button
            onClick={() => setSelectedList(list)}
            sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 1, '&:hover': { backgroundColor: 'action.hover' } }}
          >
            <ListItemIcon>
              <Typography sx={{ fontSize: '1.5rem' }}>{list.icon}</Typography>
            </ListItemIcon>
            <ListItemText primary={list.name} secondary={`${list.items_count || 0} places`} />
            {!list.is_default && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteList(list.id);
                }}
                sx={{ color: 'error.main' }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </ListItem>
        ))}
      </List>
    )}
  </Box>
)}
```

### 5. Map Markers
Add markers for saved places:
```typescript
{/* Saved Places Markers */}
{savedPlaces.map((place) => (
  <Marker
    key={place.id}
    position={{ lat: place.latitude, lng: place.longitude }}
    onClick={() => setSelectedItem(place)}
  />
))}
```

### 6. Info Window
Update the info window to include "Save to List" button:
```typescript
{selectedItem && (
  <InfoWindow position={{ lat: selectedItem.latitude, lng: selectedItem.longitude }} onCloseClick={() => setSelectedItem(null)}>
    <Box sx={{ p: 1, minWidth: 250 }}>
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
        {selectedItem.name}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {selectedItem.address}
      </Typography>
      <Button size="small" variant="contained" startIcon={<StarIcon />} onClick={() => handleSavePlace(selectedItem)} sx={{ mt: 1 }}>
        Save to List
      </Button>
    </Box>
  </InfoWindow>
)}
```

### 7. Dialogs
Add the Create List and Save to List dialogs (already implemented in the code).

## Notes
- The backend API endpoints for lists already exist at `/api/lists`
- The implementation follows the same patterns as the existing code
- The sidebar now shows saved lists instead of itinerary
- Users can click on map markers to save places to their lists

