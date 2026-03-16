import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Order "mo:core/Order";
import List "mo:core/List";
import Blob "mo:core/Blob";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  stable var _messageId : Nat = 0;
  stable var _memoryId : Nat = 0;
  stable var inviteCode : Text = "twvrs23";
  stable var startDate : Text = "";

  public type UserProfile = { name : Text };

  module CheckIn {
    public type Emotion = { #happy; #calm; #stressed; #tired; #excited; #sad };
    public type T = { userId : Blob; date : Text; emotion : Emotion };
  };

  module Message {
    public type Reaction = { emoji : Text; userId : Blob };
    public type T = {
      id : Nat; authorId : Blob; authorName : Text;
      text : Text; timestamp : Int; reactions : [Reaction];
    };
    public func compare(a : T, b : T) : Order.Order { Nat.compare(a.id, b.id) };
  };

  module Memory {
    public type T = {
      id : Nat; authorId : Blob; authorName : Text; title : Text;
      description : ?Text; blobId : ?Text; timestamp : Int;
    };
    public func compare(a : T, b : T) : Order.Order { Int.compare(b.timestamp, a.timestamp) };
  };

  stable var stableUserProfiles : [(Principal, UserProfile)] = [];
  stable var stableMessages : [Message.T] = [];
  stable var stableMemories : [Memory.T] = [];
  stable var stableCheckIns : [CheckIn.T] = [];

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

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  let storage = Map.empty<Text, Text>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let checkIns = List.empty<CheckIn.T>();
  let messages = List.empty<Message.T>();
  let memories = List.empty<Memory.T>();

  do {
    for ((p, profile) in stableUserProfiles.values()) { userProfiles.add(p, profile) };
    for (msg in stableMessages.values()) { messages.add(msg) };
    for (mem in stableMemories.values()) { memories.add(mem) };
    for (ci in stableCheckIns.values()) { checkIns.add(ci) };
  };

  system func preupgrade() {
    stableUserProfiles := userProfiles.entries().toArray();
    stableMessages := messages.toArray();
    stableMemories := memories.toArray();
    stableCheckIns := checkIns.toArray();
  };

  system func postupgrade() {
    stableUserProfiles := [];
    stableMessages := [];
    stableMemories := [];
    stableCheckIns := [];
  };

  func countUsers() : Nat {
    var count = 0;
    for ((principal, _) in userProfiles.entries()) {
      if (AccessControl.hasPermission(accessControlState, principal, #user)) { count += 1 };
    };
    count;
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) { Runtime.trap("Unauthorized") };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) { Runtime.trap("Unauthorized") };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) { Runtime.trap("Unauthorized") };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func updateInviteCode(newCode : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) { Runtime.trap("Unauthorized: Only admins can update invite code") };
    inviteCode := newCode;
  };

  public shared ({ caller }) func updateStartDate(newDate : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) { Runtime.trap("Unauthorized") };
    startDate := newDate;
  };

  public query ({ caller }) func getStartDate() : async Text {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) { Runtime.trap("Unauthorized") };
    startDate;
  };

  public shared ({ caller }) func registerWithInviteCode(code : Text, profile : UserProfile) : async () {
    if (code != inviteCode) { Runtime.trap("Invalid invite code") };
    if (userProfiles.containsKey(caller)) { Runtime.trap("User is already registered") };
    let currentCount = countUsers();
    if (currentCount >= 3) { Runtime.trap("Maximum number of users (3) already registered") };
    let isFirst = currentCount == 0;
    userProfiles.add(caller, profile);
    if (isFirst) {
      AccessControl.assignRole(accessControlState, caller, caller, #admin);
    } else {
      AccessControl.assignRole(accessControlState, caller, caller, #user);
    };
  };

  public shared ({ caller }) func submitCheckIn(date : Text, emotion : CheckIn.Emotion) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) { Runtime.trap("Unauthorized") };
    let filtered = checkIns.filter(func(ci) { ci.userId != caller.toBlob() or ci.date != date });
    checkIns.clear();
    checkIns.addAll(filtered.values());
    checkIns.add({ userId = caller.toBlob(); date; emotion });
  };

  public query ({ caller }) func getTodayCheckIns(date : Text) : async [CheckIn.T] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) { Runtime.trap("Unauthorized") };
    checkIns.filter(func(ci) { ci.date == date }).toArray();
  };

  public query ({ caller }) func getUserCheckIn(date : Text) : async ?CheckIn.T {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) { Runtime.trap("Unauthorized") };
    switch (checkIns.values().find(func(ci) { ci.userId == caller.toBlob() and ci.date == date })) {
      case (?ci) { ?ci }; case (null) { null };
    };
  };

  public query ({ caller }) func getDailyPrompt(dayOfYear : Nat) : async Text {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) { Runtime.trap("Unauthorized") };
    promptArray[dayOfYear % promptArray.size()];
  };

  public shared ({ caller }) func sendMessage(authorName : Text, text : Text) : async Message.T {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) { Runtime.trap("Unauthorized") };
    let message : Message.T = {
      id = _messageId; authorId = caller.toBlob(); authorName; text;
      timestamp = Time.now(); reactions = [];
    };
    messages.add(message);
    _messageId += 1;
    message;
  };

  public shared ({ caller }) func addReaction(messageId : Nat, emoji : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) { Runtime.trap("Unauthorized") };
    let arr = messages.toArray();
    switch (arr.findIndex(func(m) { m.id == messageId })) {
      case (null) { Runtime.trap("Message not found") };
      case (?idx) {
        let msg = arr[idx];
        if (not msg.reactions.find(func(r) { r.emoji == emoji and r.userId == caller.toBlob() }).isNull()) {
          Runtime.trap("Reaction already exists");
        };
        let updated : Message.T = { id = msg.id; authorId = msg.authorId; authorName = msg.authorName;
          text = msg.text; timestamp = msg.timestamp;
          reactions = msg.reactions.concat([{ emoji; userId = caller.toBlob() }]) };
        messages.clear();
        for (i in arr.keys()) { if (i == idx) { messages.add(updated) } else { messages.add(arr[i]) } };
      };
    };
  };

  public shared ({ caller }) func removeReaction(messageId : Nat, emoji : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) { Runtime.trap("Unauthorized") };
    let arr = messages.toArray();
    switch (arr.findIndex(func(m) { m.id == messageId })) {
      case (null) { Runtime.trap("Message not found") };
      case (?idx) {
        let msg = arr[idx];
        let updated : Message.T = { id = msg.id; authorId = msg.authorId; authorName = msg.authorName;
          text = msg.text; timestamp = msg.timestamp;
          reactions = msg.reactions.filter(func(r) { not (r.emoji == emoji and r.userId == caller.toBlob()) }) };
        messages.clear();
        for (i in arr.keys()) { if (i == idx) { messages.add(updated) } else { messages.add(arr[i]) } };
      };
    };
  };

  public query ({ caller }) func getMessages() : async [Message.T] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) { Runtime.trap("Unauthorized") };
    messages.toArray().sort();
  };

  public shared ({ caller }) func createMemory(authorName : Text, title : Text, description : ?Text, blobId : ?Text) : async Memory.T {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) { Runtime.trap("Unauthorized") };
    let memory : Memory.T = {
      id = _memoryId; authorId = caller.toBlob(); authorName; title;
      description; blobId; timestamp = Time.now();
    };
    memories.add(memory);
    _memoryId += 1;
    memory;
  };

  public shared ({ caller }) func deleteMemory(memoryId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) { Runtime.trap("Unauthorized") };
    switch (memories.values().find(func(m) { m.id == memoryId })) {
      case (null) { Runtime.trap("Memory not found") };
      case (?mem) {
        if (mem.authorId != caller.toBlob()) { Runtime.trap("Unauthorized: only author can delete") };
        let filtered = memories.filter(func(m) { m.id != memoryId });
        memories.clear();
        memories.addAll(filtered.values());
      };
    };
  };

  public query ({ caller }) func getMemories() : async [Memory.T] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) { Runtime.trap("Unauthorized") };
    memories.toArray().sort();
  };

  public query ({ caller }) func getBlobLink(blobId : Text) : async ?Text {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) { Runtime.trap("Unauthorized") };
    storage.get(blobId);
  };
};
