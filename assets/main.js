$(function () {
  var client = ZAFClient.init();
  client.invoke('resize', { width: '100%', height: '20vh' });
  

      client.get('ticket').then(function (ticketData) {
        var description = ticketData.ticket.description;
        var subject = ticketData.ticket.subject;
        var email = ticketData.ticket.requester.email;
        
      });
    
  // modal
  $('.showTicketsButton').click(function(){
    client.get('ticket.requester.email').then(function(data) {
      var requesterEmail = data['ticket.requester.email'];
      var fdApiKey = "APIkey"; //This is the base64 encoded api key from freshdesk
      var fdApiUrl = "https://yourdomain.freshdesk.com/api/v2/tickets?email=" + requesterEmail + "&include=stats"; // Replace yourdomain with actual freshdesk domain 

      $.ajax({
        url: fdApiUrl,
        type: "GET",
        headers: {
          "Authorization": "Basic " + fdApiKey
        },
        success: function(response) {
          var tickets = response;
          var ticketsList = "";


          if (tickets.length > 0) {
            console.log(tickets);
            //open modal
            client.invoke('instances.create', {
              location: 'modal',
              url: 'assets/modal.html',
              size: {
                width: '75vw',
                height: '45vw'
              }
            }).then(function(modalContext) {
              var modalClient = client.instance(modalContext['instances.create'][0].instanceGuid);
          
              client.on('modalReady', function(){
                client.get('ticket.requester.email').then(function(data) {
                  var requesterEmail= data['ticket.requester.email'];
                  var fdApiKey = "APIkey";
                  var fdApiUrl = "https://yourdomain.freshdesk.com/api/v2/tickets?email=" + requesterEmail + "&include=stats";
          
                  $.ajax({
                    url: fdApiUrl,
                    type: "GET",
                    headers: {
                      "Authorization": "Basic " + fdApiKey
                    },
                    success: function(response) {
                      var tickets = response;
                      var ticketsList = "";
                      
          
                      var priorityMap = {
                        1: "Low",
                        2: "Medium",
                        3: "High",
                        4: "Urgent"
                      };
          
                      // Make another API call to retrieve the name
                      var fdApiUserUrl = "https://yourdomain.freshdesk.com/api/v2/agents/me";
                      $.ajax({
                        url: fdApiUserUrl,
                        type: "GET",
                        headers: {
                          "Authorization": "Basic " + fdApiKey
                        },
                        success: function(userResponse) {
                          var user = response;
                          var comm_user = "";
                          var userName = userResponse.contact.name;
                          var userEmail = userResponse.contact.email;
                          console.log("User Email:", userEmail);
                          console.log("User Name:", userName);
                          comm_user +="<p class=nameU>User Name: "+ userName +"</p><p class=nameU>Email: "+ userEmail +"</p>";
          
                          for (var i = 0; i < tickets.length; i++) {
                            var ticketUrl = "https://yourdomain.freshdesk.com/helpdesk/tickets/" + tickets[i].id;
                            var ticketLink = "<a href='" + ticketUrl + "' target='_blank'>" + tickets[i].subject + "</a>";
                            var groupId = tickets[i].group_id ? tickets[i].group_id : "Not assigned";
                            var assigneeName = tickets[i].responder_name;
                            if (assigneeName == null) {
                              assigneeName = "Unassigned";
                            }
                            var dateCreated = new Date(tickets[i].created_at).toLocaleString("en-IN", {timeZone: "Asia/Kolkata", day: '2-digit', month: '2-digit', year: 'numeric'});
                            var timeCreated = new Date(tickets[i].created_at).toLocaleString("en-IN", {timeZone: "Asia/Kolkata", hour: '2-digit', minute: '2-digit', second: '2-digit'});
                            var priority = tickets[i].priority;
                            var priorityText = priorityMap[priority] || "Unknown";
                            var ticketId = tickets[i].id;
                            var ticketIdCell = "<td id='ticket-id' class=tId ><button class= tId_btn title=click_here_to_open_conversation>" + ticketId + "</button></td>";
                            var dateCell = "<td>" + dateCreated + "</td>";
                            var timeCell = "<td>" + timeCreated + "</td>";
                            var statusText = "";
          
                            if (tickets[i].status == 2) {
                              statusText = "Open";
                            } else if (tickets[i].status == 3) {
                              statusText = "Pending";
                            } else if (tickets[i].status == 4) {
                              statusText = "Resolved";
                            } else if (tickets[i].status == 5) {
                              statusText = "Closed";
                            } else {
                              statusText = "Unknown";
                            }
                            var userName = userResponse.contact.name;
                            var userNameCell = "<td class=comm-user id=comm_user style=display:none>" + userName + "</td>"; // Add the username column
          
                            ticketsList += "<tr>" + ticketIdCell + "<td>" + ticketLink + "</td><td>" + statusText + "</td><td>" + groupId + "</td><td>" + assigneeName + "</td><td>" + dateCell + timeCell + "</td><td>" + priorityText + "</td>" + userNameCell + "</tr>";
                          }
          
                          modalClient.trigger('drawTickets', ticketsList);
                          modalClient.trigger('drawUser', comm_user)
                        },
                        error: function() {
                          // Handle error when retrieving user data
                          alert("Error: Failed to retrieve user data.");
                        }
                      });
                    },
                    error: function() {
                      // Handle error when retrieving tickets data
                      alert("Error: Failed to retrieve tickets data.");
                    }
                  });
                });
              });
              
              modalClient.on('modal.close', function() {
                // The modal has been closed
              });
            });
          }
          else{
            alert("Tickets not found.");
          }
        },
        error: function() {
          var errorMessage = "No tickets found on Freshdesk";
        $('#error_p').text("Error: " + errorMessage);
        }
      });
      });  
  });
});
