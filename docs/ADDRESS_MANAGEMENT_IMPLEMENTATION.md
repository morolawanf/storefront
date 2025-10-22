# Address Management System Implementation

## Overview
Complete address management system with full CRUD operations using TanStack Query and mutations. No dummy data - all operations hit real API endpoints.

## Files Created

### 1. `/src/types/user.ts` (93 lines)
**Purpose**: TypeScript types for user and address data

**Key Types**:
```typescript
- Address: Full address model with _id, active flag, and all required fields
- AddAddressInput: Input type for creating new addresses
- UpdateAddressInput: Partial input type for updating addresses
- UserProfile: Complete user profile with address array
- AddressResponse, AddressesResponse, DeleteAddressResponse: API response types
```

**Fields Required**:
- firstName, lastName, phoneNumber
- address1, city, zipCode, state, country
- address2 (optional)
- active (boolean, default false)

---

### 2. `/src/libs/api/endpoints.ts` (Updated)
**Purpose**: Added address-specific API endpoints

**New Endpoints**:
```typescript
user: {
  addresses: "/user/address/all",           // GET - Fetch all addresses
  addAddress: "/user/address",              // POST - Add new address
  updateAddress: (id) => `/user/address/${id}`,  // PUT - Update address
  deleteAddress: (id) => `/user/address/${id}`,  // DELETE - Delete address
}
```

---

### 3. `/src/hooks/queries/useAddresses.ts` (27 lines)
**Purpose**: TanStack Query hook for fetching user addresses

**Features**:
- ✅ Fetches all user addresses from `/user/address/all`
- ✅ 5-minute stale time
- ✅ Cached with `['user', 'addresses']` query key
- ✅ Automatically refetches on invalidation
- ✅ Returns `Address[]` array
- ✅ No refetch on window focus

**Usage**:
```typescript
const { data: addresses, isLoading, error } = useAddresses();
```

---

### 4. `/src/hooks/mutations/useAddressMutations.ts` (71 lines)
**Purpose**: TanStack Query mutations for address CRUD operations

**Three Mutations**:

#### useAddAddress()
- Creates new address
- Automatically invalidates addresses query
- Returns created `Address` object

```typescript
const addMutation = useAddAddress();
await addMutation.mutateAsync(addressData);
```

#### useUpdateAddress()
- Updates existing address by ID
- Handles "set active" logic (deactivates others)
- Automatically invalidates addresses query
- Returns updated `Address[]` array

```typescript
const updateMutation = useUpdateAddress();
await updateMutation.mutateAsync({
  addressId: '123',
  updates: { active: true }
});
```

#### useDeleteAddress()
- Deletes address by ID
- Backend automatically sets first remaining address as active if deleted address was active
- Automatically invalidates addresses query

```typescript
const deleteMutation = useDeleteAddress();
await deleteMutation.mutateAsync('addressId');
```

**Auto-Refetch**: All mutations call `queryClient.invalidateQueries()` to refetch addresses after success.

---

### 5. `/src/components/MyAccount/MyAddress.tsx` (Completely Rebuilt - 653 lines)
**Purpose**: Full-featured address management UI with CRUD operations

## Key Features

### 🎨 UI States

#### 1. Loading State
- Spinner with "Loading addresses..." message
- Displays while fetching addresses

#### 2. Error State
- Red alert box with error icon
- Shows fetch error message
- No dummy data fallback

#### 3. Empty State
- Map pin icon
- "No addresses yet" message
- "Add Address" button to get started

#### 4. Address List
- Accordion-style expandable addresses
- Active address has black 2px border
- Inactive addresses have light border
- Smooth expand/collapse animation

### 📝 Forms

#### Add New Address Form
- Opens when "Add New Address" button clicked
- Black border to highlight new form
- Close button (X icon) in header
- Full validation with inline error messages
- "Set as active address" checkbox
- Submit button shows "Adding..." during mutation
- Cancel button to abort

#### Edit Address Form
- Replaces view mode when "Edit" button clicked
- Pre-fills with existing address data
- Same validation as add form
- Submit button shows "Updating..." during mutation
- Cancel button reverts to view mode

### ✅ Form Validation

**Client-side Validation**:
- Required fields: firstName, lastName, phoneNumber, address1, city, zipCode, state, country
- Optional fields: address2
- Red border on invalid inputs
- Inline error messages below fields
- Errors clear when user starts typing

**Error Display**:
```
❌ "First name is required"
❌ "Address is required"
❌ "ZIP code is required"
```

### 🔧 CRUD Operations

#### Create (Add Address)
1. Click "Add New Address" button
2. Fill out form
3. Optionally check "Set as active address"
4. Click "Add Address"
5. Mutation runs → Query invalidates → List refreshes
6. Form resets on success

#### Read (View Addresses)
- List of all addresses in accordion
- Click address header to expand/collapse
- Active address shown with "Active" badge
- Shows: Full name, phone, complete address

#### Update (Edit Address)
1. Expand address
2. Click "Edit" button
3. Form appears with pre-filled data
4. Modify fields
5. Click "Update Address"
6. Mutation runs → Query invalidates → List refreshes
7. Returns to view mode on success

#### Delete (Remove Address)
1. Expand address
2. Click "Delete" button
3. Browser confirm dialog: "Are you sure?"
4. If confirmed, mutation runs
5. Query invalidates → List refreshes
6. Backend auto-sets first remaining address as active if deleted address was active

#### Set Active
1. Expand non-active address
2. Click "Set as Active" button
3. Backend deactivates all other addresses
4. Backend activates selected address
5. Query invalidates → List refreshes
6. Active badge appears, border changes to black

### 🚨 Error Handling (In UI, No Alerts)

**Fetch Errors**:
```tsx
<div className="bg-red/10 border border-red text-red">
  <Icon.WarningCircle />
  <div>
    <div className="font-semibold">Failed to load addresses</div>
    <div className="text-sm">{error.message}</div>
  </div>
</div>
```

**Mutation Errors**:
```tsx
{(addMutation.isError || updateMutation.isError || deleteMutation.isError) && (
  <div className="bg-red/10 border border-red text-red">
    <Icon.WarningCircle />
    <div>
      <div className="font-semibold">Operation Failed</div>
      <div className="text-sm">{mutation.error?.message}</div>
    </div>
  </div>
)}
```

**No `window.alert()` or `console.log()` for user-facing errors** - all errors displayed in UI with proper styling.

### 🎭 Action Buttons (Context-Aware)

**For Active Address**:
- ✅ Edit
- ✅ Delete

**For Inactive Address**:
- ✅ Set as Active
- ✅ Edit
- ✅ Delete

**Button States**:
- Disabled during mutations (shows "Setting...", "Updating...", "Deleting...")
- Proper hover states
- Icon + text labels

### 🎨 Design System Compliance

**Colors**:
- Active border: `border-black border-2`
- Inactive border: `border-line`
- Error background: `bg-red/10`
- Error border: `border-red`
- Error text: `text-red`
- Surface background: `bg-surface`

**Icons** (Phosphor Icons):
- Plus - Add new
- X - Close/Cancel
- CaretDown - Expand/collapse
- CircleNotch - Loading spinner
- WarningCircle - Errors
- MapPin - Empty state
- PencilSimple - Edit
- Trash - Delete

**Typography**:
- heading6 - Section titles
- caption1 - Labels
- text-button - Button text
- text-secondary - Helper text
- text-title - Data values

**Spacing**:
- Consistent padding: p-4, p-6
- Gap spacing: gap-3, gap-4
- Margin top: mt-2, mt-6

---

## Backend API Integration

### API Routes (from `/src/routes/users/user.ts`)

#### GET `/user/address/all`
**Authentication**: Required  
**Response**:
```json
{
  "message": "User addresses retrieved successfully",
  "data": [
    {
      "_id": "65abc123...",
      "firstName": "John",
      "lastName": "Doe",
      "phoneNumber": "+1234567890",
      "address1": "123 Main St",
      "address2": "Apt 4",
      "city": "New York",
      "zipCode": "10001",
      "state": "NY",
      "country": "United States",
      "active": true
    }
  ]
}
```

#### POST `/user/address`
**Authentication**: Required  
**Validation**: `UserValidator.validateAddAddress`  
**Request Body**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890",
  "address1": "123 Main St",
  "address2": "Apt 4",  // optional
  "city": "New York",
  "zipCode": "10001",
  "state": "NY",
  "country": "United States",
  "active": false  // optional, default false
}
```
**Response**:
```json
{
  "message": "Address added successfully",
  "data": { /* created address */ }
}
```

**Backend Logic** (`UserService.addAddress`):
- If `active: true`, deactivates all other addresses in transaction
- Adds new address to user's `address` array
- Returns created address

#### PUT `/user/address/:addressId`
**Authentication**: Required  
**Validation**: `UserValidator.validateUpdateAddress`  
**Request Body** (all fields optional):
```json
{
  "firstName": "Jane",
  "active": true  // Setting this deactivates all other addresses
}
```
**Response**:
```json
{
  "message": "Address updated successfully",
  "data": [ /* all user addresses */ ]
}
```

**Backend Logic** (`UserService.updateAddress`):
- If `active: true`, uses aggregation pipeline to deactivate others
- Updates target address with provided fields
- Returns all addresses

#### DELETE `/user/address/:addressId`
**Authentication**: Required  
**Validation**: `UserValidator.validateDeleteAddress`  
**Response**:
```json
{
  "message": "Address deleted successfully",
  "data": null
}
```

**Backend Logic** (`UserService.deleteAddress`):
- Removes address from array
- If deleted address was active, automatically sets first remaining address as active
- Uses transaction for atomic operation

---

## User Flows

### Flow 1: Add First Address
1. User navigates to My Account → Address tab
2. Sees empty state with "No addresses yet"
3. Clicks "Add Address"
4. Fills out form, checks "Set as active address"
5. Clicks "Add Address"
6. Address appears in list with "Active" badge and black border

### Flow 2: Add Additional Address
1. User clicks "Add New Address" button
2. Form appears at top
3. Fills out form, leaves "Set as active" unchecked
4. Clicks "Add Address"
5. Address appears in list without "Active" badge
6. Previous active address remains active

### Flow 3: Edit Address
1. User clicks on address to expand it
2. Clicks "Edit" button
3. Form appears with pre-filled data
4. Changes some fields (e.g., phone number)
5. Clicks "Update Address"
6. Address collapses back to view mode with updated data

### Flow 4: Change Active Address
1. User expands an inactive address
2. Clicks "Set as Active"
3. Backend deactivates previous active address
4. Backend activates selected address
5. List refreshes
6. New address shows "Active" badge with black border
7. Previous active address no longer has badge/border

### Flow 5: Delete Address
1. User expands address they want to delete
2. Clicks "Delete" button
3. Browser confirm dialog appears
4. User confirms
5. Address is removed from list
6. If it was active, first remaining address becomes active automatically

### Flow 6: Handle Errors
**Scenario**: Network error during fetch
1. Error banner appears at top
2. Shows: "Failed to load addresses" with error message
3. No addresses shown
4. User can refresh page to retry

**Scenario**: Validation error during add
1. User submits form with empty required fields
2. Red borders appear on invalid inputs
3. Error messages show below each field
4. User fills in missing data
5. Errors clear as they type
6. Form submits successfully

**Scenario**: API error during update
1. User tries to update address
2. API returns error (e.g., "Address not found")
3. Red error banner appears at top of component
4. Shows: "Operation Failed" with API error message
5. Form remains in edit mode
6. User can retry or cancel

---

## Technical Highlights

### ✅ No Dummy Data
- All operations hit real API endpoints
- No fallback/mock data
- Pure API integration

### ✅ Optimistic UI Updates
- Mutations automatically invalidate queries
- UI refreshes with server data after each operation
- No manual cache manipulation needed

### ✅ Form State Management
- Single `formData` state for both add and edit
- Single `handleSubmit` function decides add vs update
- Validation errors cleared on input change

### ✅ UI State Management
- `expandedAddressId`: Which address is expanded (null or string)
- `isAddingNew`: Whether add form is open (boolean)
- `editingId`: Which address is being edited (null or string)
- `formData`: Current form values (AddAddressInput)
- `formErrors`: Validation errors (Record<string, string>)

### ✅ TypeScript Strict Mode
- All types imported from `/src/types/user.ts`
- No `any` types
- Proper error typing with `Error` interface

### ✅ Accessibility
- Proper labels with `htmlFor`
- Required field indicators (`*`)
- Keyboard navigation (buttons are real `<button>` elements)
- Semantic HTML (forms, labels, inputs)

### ✅ Performance
- Query caching (5-minute stale time)
- Only refetches on invalidation
- No unnecessary re-renders
- Early return if tab not active

---

## Testing Checklist

### ✅ CRUD Operations
- [ ] Can add first address
- [ ] Can add multiple addresses
- [ ] Can edit address fields
- [ ] Can set address as active
- [ ] Can delete address
- [ ] Active address badge updates correctly
- [ ] Border styling changes on active/inactive

### ✅ Validation
- [ ] Empty required fields show errors
- [ ] Errors have red borders
- [ ] Errors clear when typing
- [ ] Can't submit invalid form
- [ ] Optional fields work without errors

### ✅ UI States
- [ ] Loading spinner shows during fetch
- [ ] Empty state shows when no addresses
- [ ] Error banner shows on fetch failure
- [ ] Mutation errors show in red banner
- [ ] Active address has black 2px border
- [ ] Expand/collapse animation works
- [ ] Forms can be canceled

### ✅ Active Address Logic
- [ ] Only one address can be active
- [ ] Setting one active deactivates others
- [ ] Deleting active address makes next one active
- [ ] Active badge displays correctly
- [ ] "Set as Active" button only shows for inactive addresses

### ✅ Error Handling
- [ ] Network errors show in UI (not alert)
- [ ] API errors show in UI (not alert)
- [ ] Validation errors show inline
- [ ] No console errors (except intentional logging)

### ✅ Responsive Design
- [ ] Forms are mobile-friendly
- [ ] Buttons wrap properly on small screens
- [ ] Two-column grid stacks on mobile

---

## Component Size
- **MyAddress.tsx**: 653 lines
  - Within acceptable range for complex forms
  - Could be abstracted into sub-components if needed:
    - `AddressForm` (reusable for add/edit)
    - `AddressCard` (view mode for single address)
    - `AddressListItem` (accordion item)

---

## Future Enhancements (Optional)

### 🔄 Potential Improvements
1. **Address validation API**: Validate address with real postal service
2. **Address autocomplete**: Google Places API integration
3. **Default address types**: Separate "billing" vs "shipping"
4. **Address nicknames**: "Home", "Work", "Parents' House"
5. **Bulk operations**: Select multiple addresses to delete
6. **Address import**: Import from previous orders
7. **Maps preview**: Show address on map when expanded
8. **Address verification**: Flag undeliverable addresses

### 🎨 UI Polish
1. **Smooth animations**: Framer Motion for expand/collapse
2. **Success toasts**: Show success message after operations
3. **Undo delete**: Temporarily cache deleted address with undo button
4. **Drag to reorder**: Change address display order
5. **Address cards**: Alternative layout to accordion

---

## Summary

This implementation provides a **production-ready** address management system that:
1. **Follows Next.js patterns** (client components with hooks)
2. **Uses TanStack Query** (queries + mutations, auto-refetch)
3. **Handles all CRUD operations** (create, read, update, delete)
4. **Validates input** (client-side with inline errors)
5. **Displays errors in UI** (no window alerts)
6. **Matches design system** (Tailwind classes, Phosphor icons)
7. **Supports active address** (only one active, auto-deactivates others)
8. **No dummy data** (pure API integration)
9. **TypeScript strict** (proper types throughout)
10. **Accessible** (proper labels, semantic HTML)

All backend API routes are properly integrated, validation matches backend requirements, and error handling is comprehensive with user-friendly UI feedback.
