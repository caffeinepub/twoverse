import Map "mo:core/Map";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Order "mo:core/Order";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  stable var _messageId : Nat = 0;
  stable var _memoryId : Nat = 0;
  stable var startDate : Text = "";

  // Kept for upgrade compatibility
  stable var inviteCode : Text = "";
  stable var PASSKEY : Text = "3275";

  public type UserProfile = { name : Text };

  // Old types - kept so stable Maps/Lists with these types load correctly on upgrade
  module OldCheckIn {
    public type Emotion = { #happy; #calm; #stressed; #tired; #excited; #sad };
    public type T = { userId : Blob; date : Text; emotion : Emotion };
  };
  module OldReaction = {
    public type T = { emoji : Text; userId : Blob };
  };
  module OldMessage {
    public type T = {
      id : Nat; authorId : Blob; authorName : Text;
      text : Text; timestamp : Int; reactions : [OldReaction.T];
    };
  };
  module OldMemory {
    public type T = {
      id : Nat; authorId : Blob; authorName : Text; title : Text;
      description : ?Text; blobId : ?Text; timestamp : Int;
    };
  };

  // New types
  module CheckIn {
    public type Emotion = { #happy; #calm; #stressed; #tired; #excited; #sad };
    public type T = { sessionId : Text; date : Text; emotion : Emotion };
  };
  module Message {
    public type Reaction = { emoji : Text; sessionId : Text };
    public type T = {
      id : Nat; authorId : Text; authorName : Text;
      text : Text; timestamp : Int; reactions : [Reaction];
    };
    public func compare(a : T, b : T) : Order.Order { Nat.compare(a.id, b.id) };
  };
  module Memory {
    public type T = {
      id : Nat; authorId : Text; authorName : Text; title : Text;
      description : ?Text; blobId : ?Text; timestamp : Int;
    };
    public func compare(a : T, b : T) : Order.Order { Int.compare(b.timestamp, a.timestamp) };
  };

  // OLD stable arrays - kept with original names/types for upgrade compat
  stable var stableUserProfiles : [(Principal, UserProfile)] = [];
  stable var stableMessages : [OldMessage.T] = [];
  stable var stableMemories : [OldMemory.T] = [];
  stable var stableCheckIns : [OldCheckIn.T] = [];

  // NEW stable arrays
  stable var stableUserProfiles2 : [(Text, UserProfile)] = [];
  stable var stableMessages2 : [Message.T] = [];
  stable var stableMemories2 : [Memory.T] = [];
  stable var stableCheckIns2 : [CheckIn.T] = [];

  let promptArray = [
    "What is your favorite thing about today?",
    "Describe a perfect day together.",
    "Share a childhood memory.",
    "What are you most grateful for?",
    "Describe your partner in one word.",
    "What made you smile today?",
    "Where would you like to travel together?",
    "Share a funny story.",
    "What do you appreciate most in each other?",
    "Describe your first impression.",
    "What is your favorite shared activity?",
    "Share a secret wish.",
    "Describe your ideal date night.",
    "What is your favorite memory together?",
    "Share something you admire.",
    "Describe a challenge you overcame together.",
    "What is your favorite way to relax?",
    "Share a dream for the future.",
    "Describe a perfect weekend.",
    "What makes you feel loved?",
  ];

  // OLD live stable Maps - kept with original types/names for upgrade compat
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();
  let storage = Map.empty<Text, Text>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let checkIns = List.empty<OldCheckIn.T>();
  let messages = List.empty<OldMessage.T>();
  let memories = List.empty<OldMemory.T>();

  // NEW live stable vars
  let userProfilesV2 = Map.empty<Text, UserProfile>();
  let checkInsV2 = List.empty<CheckIn.T>();
  let messagesV2 = List.empty<Message.T>();
  let memoriesV2 = List.empty<Memory.T>();

  do {
    // Load old data into old vars (for upgrade compat)
    for ((p, profile) in stableUserProfiles.values()) { userProfiles.add(p, profile) };
    for (msg in stableMessages.values()) { messages.add(msg) };
    for (mem in stableMemories.values()) { memories.add(mem) };
    for (ci in stableCheckIns.values()) { checkIns.add(ci) };
    // Load new data into new vars
    for ((sid, profile) in stableUserProfiles2.values()) { userProfilesV2.add(sid, profile) };
    for (msg in stableMessages2.values()) { messagesV2.add(msg) };
    for (mem in stableMemories2.values()) { memoriesV2.add(mem) };
    for (ci in stableCheckIns2.values()) { checkInsV2.add(ci) };
  };

  system func preupgrade() {
    stableUserProfiles := userProfiles.entries().toArray();
    stableMessages := messages.toArray();
    stableMemories := memories.toArray();
    stableCheckIns := checkIns.toArray();
    stableUserProfiles2 := userProfilesV2.entries().toArray();
    stableMessages2 := messagesV2.toArray();
    stableMemories2 := memoriesV2.toArray();
    stableCheckIns2 := checkInsV2.toArray();
  };

  system func postupgrade() {
    stableUserProfiles := [];
    stableMessages := [];
    stableMemories := [];
    stableCheckIns := [];
    stableUserProfiles2 := [];
    stableMessages2 := [];
    stableMemories2 := [];
    stableCheckIns2 := [];
  };

  // Auto-register the session if not already known (passkey already verified on frontend)
  func ensureRegistered(sessionId : Text, name : Text) {
    if (sessionId.size() == 0) { Runtime.trap("Invalid session") };
    if (not userProfilesV2.containsKey(sessionId)) {
      userProfilesV2.add(sessionId, { name });
    };
  };

  // Keep registerUser for any legacy calls - now always succeeds
  public shared func registerUser(sessionId : Text, name : Text, passkey : Text) : async () {
    if (sessionId.size() == 0) { Runtime.trap("Invalid session ID") };
    userProfilesV2.add(sessionId, { name });
    ignore passkey;
  };

  public query func getProfile(sessionId : Text) : async ?UserProfile {
    userProfilesV2.get(sessionId);
  };

  public shared func saveProfile(sessionId : Text, profile : UserProfile) : async () {
    if (sessionId.size() == 0) { Runtime.trap("Invalid session") };
    userProfilesV2.add(sessionId, profile);
  };

  public query func getStartDate() : async Text { startDate };

  public shared func updateStartDate(sessionId : Text, date : Text) : async () {
    if (sessionId.size() == 0) { Runtime.trap("Invalid session") };
    startDate := date;
  };

  public shared func submitCheckIn(sessionId : Text, date : Text, emotion : CheckIn.Emotion) : async () {
    ensureRegistered(sessionId, "");
    let filtered = checkInsV2.filter(func(ci) { ci.sessionId != sessionId or ci.date != date });
    checkInsV2.clear();
    checkInsV2.addAll(filtered.values());
    checkInsV2.add({ sessionId; date; emotion });
  };

  public query func getTodayCheckIns(date : Text) : async [CheckIn.T] {
    checkInsV2.filter(func(ci) { ci.date == date }).toArray();
  };

  public query func getUserCheckIn(sessionId : Text, date : Text) : async ?CheckIn.T {
    switch (checkInsV2.values().find(func(ci) { ci.sessionId == sessionId and ci.date == date })) {
      case (?ci) { ?ci }; case (null) { null };
    };
  };

  public query func getDailyPrompt(dayOfYear : Nat) : async Text {
    promptArray[dayOfYear % promptArray.size()];
  };

  public shared func sendMessage(sessionId : Text, authorName : Text, text : Text) : async Message.T {
    ensureRegistered(sessionId, authorName);
    let message : Message.T = {
      id = _messageId; authorId = sessionId; authorName; text;
      timestamp = Time.now(); reactions = [];
    };
    messagesV2.add(message);
    _messageId += 1;
    message;
  };

  public shared func addReaction(sessionId : Text, messageId : Nat, emoji : Text) : async () {
    ensureRegistered(sessionId, "");
    let arr = messagesV2.toArray();
    switch (arr.findIndex(func(m) { m.id == messageId })) {
      case (null) { Runtime.trap("Message not found") };
      case (?idx) {
        let msg = arr[idx];
        if (not msg.reactions.find(func(r) { r.emoji == emoji and r.sessionId == sessionId }).isNull()) {
          Runtime.trap("Reaction already exists");
        };
        let updated : Message.T = { id = msg.id; authorId = msg.authorId; authorName = msg.authorName;
          text = msg.text; timestamp = msg.timestamp;
          reactions = msg.reactions.concat([{ emoji; sessionId }]) };
        messagesV2.clear();
        for (i in arr.keys()) { if (i == idx) { messagesV2.add(updated) } else { messagesV2.add(arr[i]) } };
      };
    };
  };

  public shared func removeReaction(sessionId : Text, messageId : Nat, emoji : Text) : async () {
    ensureRegistered(sessionId, "");
    let arr = messagesV2.toArray();
    switch (arr.findIndex(func(m) { m.id == messageId })) {
      case (null) { Runtime.trap("Message not found") };
      case (?idx) {
        let msg = arr[idx];
        let updated : Message.T = { id = msg.id; authorId = msg.authorId; authorName = msg.authorName;
          text = msg.text; timestamp = msg.timestamp;
          reactions = msg.reactions.filter(func(r) { not (r.emoji == emoji and r.sessionId == sessionId) }) };
        messagesV2.clear();
        for (i in arr.keys()) { if (i == idx) { messagesV2.add(updated) } else { messagesV2.add(arr[i]) } };
      };
    };
  };

  public query func getMessages() : async [Message.T] {
    messagesV2.toArray().sort();
  };

  public shared func createMemory(sessionId : Text, authorName : Text, title : Text, description : ?Text, blobId : ?Text) : async Memory.T {
    ensureRegistered(sessionId, authorName);
    let memory : Memory.T = {
      id = _memoryId; authorId = sessionId; authorName; title;
      description; blobId; timestamp = Time.now();
    };
    memoriesV2.add(memory);
    _memoryId += 1;
    memory;
  };

  public shared func deleteMemory(sessionId : Text, memoryId : Nat) : async () {
    ensureRegistered(sessionId, "");
    switch (memoriesV2.values().find(func(m) { m.id == memoryId })) {
      case (null) { Runtime.trap("Memory not found") };
      case (?mem) {
        if (mem.authorId != sessionId) { Runtime.trap("Unauthorized: only author can delete") };
        let filtered = memoriesV2.filter(func(m) { m.id != memoryId });
        memoriesV2.clear();
        memoriesV2.addAll(filtered.values());
      };
    };
  };

  public query func getMemories() : async [Memory.T] {
    memoriesV2.toArray().sort();
  };
};
